import { type ZodType, z } from "zod";

import {
	GEOTAB_API_PATH,
	GEOTAB_DEFAULT_SERVER,
	GEOTAB_SAME_SERVER_PATH,
	GEOTAB_VALIDATION_RESULTS_LIMIT,
} from "./constants";
import type { GpsProvider } from "./types";

export const geotabCredentialsSchema = z.object({
	server: z.string().min(1).default(GEOTAB_DEFAULT_SERVER),
	database: z.string().min(1),
	userName: z.string().min(1),
	password: z.string().min(1),
});

export type GeotabCredentials = z.infer<typeof geotabCredentialsSchema>;

const rpcEnvelopeSchema = z.object({
	result: z.unknown().optional(),
	error: z
		.object({ name: z.string().optional(), message: z.string() })
		.optional(),
});

const authenticateResultSchema = z.object({
	credentials: z.object({
		database: z.string(),
		userName: z.string(),
		sessionId: z.string(),
	}),
	path: z.string(),
});

const deviceSchema = z.object({
	id: z.string(),
	name: z.string(),
	licensePlate: z.string().nullish(),
});

const deviceStatusInfoSchema = z.object({
	device: z.object({ id: z.string() }),
	latitude: z.number(),
	longitude: z.number(),
	speed: z.number().nullish(),
	bearing: z.number().nullish(),
	dateTime: z.coerce.date(),
});

async function callGeotab<Result>(
	server: string,
	method: string,
	params: Record<string, unknown>,
	resultSchema: ZodType<Result>,
	fetchImpl: typeof fetch,
): Promise<Result> {
	const response = await fetchImpl(`https://${server}${GEOTAB_API_PATH}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ method, params }),
	});
	if (!response.ok) {
		throw new Error(`Geotab ${method} failed with HTTP ${response.status}`);
	}
	const envelope = rpcEnvelopeSchema.parse(await response.json());
	if (envelope.error) {
		const errorName = envelope.error.name ? `${envelope.error.name}: ` : "";
		throw new Error(
			`Geotab ${method} failed: ${errorName}${envelope.error.message}`,
		);
	}
	return resultSchema.parse(envelope.result);
}

async function authenticateAndGet<Entity>(
	credentials: GeotabCredentials,
	typeName: string,
	entitySchema: ZodType<Entity>,
	fetchImpl: typeof fetch,
	extraParams: Record<string, unknown> = {},
): Promise<Entity[]> {
	const session = await callGeotab(
		credentials.server,
		"Authenticate",
		{
			database: credentials.database,
			userName: credentials.userName,
			password: credentials.password,
		},
		authenticateResultSchema,
		fetchImpl,
	);
	const sessionServer =
		session.path === GEOTAB_SAME_SERVER_PATH
			? credentials.server
			: session.path;
	return callGeotab(
		sessionServer,
		"Get",
		{ typeName, credentials: session.credentials, ...extraParams },
		z.array(entitySchema),
		fetchImpl,
	);
}

export const geotabProvider: GpsProvider<GeotabCredentials> = {
	kind: "geotab",
	credentialsSchema: geotabCredentialsSchema,
	async validateCredentials(credentials, fetchImpl = fetch) {
		await authenticateAndGet(credentials, "Device", deviceSchema, fetchImpl, {
			resultsLimit: GEOTAB_VALIDATION_RESULTS_LIMIT,
		});
	},
	async listVehicles(credentials, fetchImpl = fetch) {
		const devices = await authenticateAndGet(
			credentials,
			"Device",
			deviceSchema,
			fetchImpl,
		);
		return devices.map((device) => ({
			externalId: device.id,
			name: device.name,
			plate: device.licensePlate || null,
		}));
	},
	async fetchLatestPositions(credentials, fetchImpl = fetch) {
		const statuses = await authenticateAndGet(
			credentials,
			"DeviceStatusInfo",
			deviceStatusInfoSchema,
			fetchImpl,
		);
		return statuses.map((status) => ({
			externalId: status.device.id,
			lat: status.latitude,
			lng: status.longitude,
			speedKmh: status.speed ?? null,
			heading: status.bearing ?? null,
			recordedAt: status.dateTime,
		}));
	},
};
