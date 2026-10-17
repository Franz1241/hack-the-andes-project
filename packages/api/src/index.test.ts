import { createRequire } from "node:module";
import { samsaraProvider } from "@hack-the-andes-project/business/providers/index";
import * as routing from "@hack-the-andes-project/business/routing/osrm";
import type { vehicle } from "@hack-the-andes-project/db/schema/fleet";
import { call, createRouterClient } from "@orpc/server";
import { createRequestLogger } from "evlog";
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	expectTypeOf,
	it,
	vi,
} from "vitest";

import {
	ALERT_STATUS_OPEN,
	CREDENTIALS_VALIDATION_FAILED_MESSAGE,
	ROUTING_FAILED_MESSAGE,
	VEHICLE_POSITION_REQUIRED_MESSAGE,
} from "./constants";
import type { Context } from "./context";
import { organizationProcedure } from "./index";
import { appRouter } from "./routers/index";

const databaseRequire = createRequire(
	import.meta.resolve("@hack-the-andes-project/db"),
);
vi.doMock(databaseRequire.resolve("mysql2/promise"), () => ({
	default: {
		createConnection: vi.fn(async () => ({
			config: {},
			query: vi.fn(),
			end: vi.fn(),
		})),
	},
}));

const { createDb } = await import("@hack-the-andes-project/db");
const { createAuth } = await import("@hack-the-andes-project/auth");
const database = await createDb({
	host: "mock",
	port: Number.NaN,
	user: "mock",
	password: "mock",
	database: "mock",
});
const auth = createAuth(
	{
		BETTER_AUTH_URL: "https://api.example.com",
		BETTER_AUTH_SECRET: "test-secret-for-organization-procedure",
		ALLOWED_ORIGINS: "https://app.example.com",
	},
	database,
);
const createdAt = new Date("2026-10-17T00:00:00.000Z");
const session = {
	user: {
		id: "fleet-owner",
		name: "Fleet Owner",
		email: "owner@example.com",
		emailVerified: true,
		createdAt,
		updatedAt: createdAt,
	},
	session: {
		id: "session",
		userId: "fleet-owner",
		token: "session-token",
		createdAt,
		updatedAt: createdAt,
		expiresAt: new Date("2026-10-18T00:00:00.000Z"),
		activeOrganizationId: "selected-organization",
	},
};

function contextFor(session: Context["session"]): Context {
	return {
		db: database,
		auth,
		log: createRequestLogger(),
		session,
		encryptionKey: "unused-in-middleware-tests",
		osrmBaseUrl: "https://routing.example.com",
		waitUntil: (promise) => void promise,
	};
}

const procedure = organizationProcedure.handler(({ context }) => {
	expectTypeOf(context.organizationId).toEqualTypeOf<string>();
	expectTypeOf(context.session).toEqualTypeOf<
		NonNullable<Context["session"]>
	>();
	return context.organizationId;
});

beforeEach(() => {
	vi.spyOn(database.query.member, "findFirst").mockResolvedValue({
		id: "membership",
		organizationId: session.session.activeOrganizationId,
		userId: session.user.id,
		role: "owner",
		createdAt,
	});
});

afterAll(async () => {
	await database.$client.end();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("organizationProcedure", () => {
	it("rejects an unauthenticated request", async () => {
		await expect(
			call(procedure, undefined, { context: contextFor(null) }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it.each([null, undefined, ""])(
		"rejects an authenticated session without an active organization (%s)",
		async (activeOrganizationId) => {
			await expect(
				call(procedure, undefined, {
					context: contextFor({
						...session,
						session: { ...session.session, activeOrganizationId },
					}),
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		},
	);

	it("rejects a removed member even when the cached session still selects the organization", async () => {
		const findMembership = vi
			.spyOn(database.query.member, "findFirst")
			.mockResolvedValue(undefined);
		await expect(
			call(procedure, undefined, { context: contextFor(session) }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(findMembership).toHaveBeenCalledWith({
			columns: { id: true },
			where: {
				organizationId: session.session.activeOrganizationId,
				userId: session.user.id,
			},
		});
	});

	it("passes the selected organization to downstream handlers", async () => {
		await expect(
			call(procedure, undefined, { context: contextFor(session) }),
		).resolves.toBe(session.session.activeOrganizationId);
	});
});

describe("fleet procedure boundaries", () => {
	const fleetRouters: Array<
		keyof Pick<
			typeof appRouter,
			"connections" | "vehicles" | "trips" | "alerts"
		>
	> = ["connections", "vehicles", "trips", "alerts"];
	const tripInput = {
		vehicleId: "fleet-vehicle",
		name: "Delivery",
		destination: { lat: 0, lng: 0 },
	};
	const positionedVehicle: typeof vehicle.$inferSelect = {
		id: tripInput.vehicleId,
		organizationId: session.session.activeOrganizationId,
		connectionId: "fleet-connection",
		externalId: "provider-vehicle",
		name: "Truck",
		plate: null,
		lastLat: 0,
		lastLng: 0,
		lastHeading: null,
		lastSpeedKmh: null,
		lastPositionAt: createdAt,
		active: true,
		createdAt,
		updatedAt: createdAt,
	};

	it.each(fleetRouters)(
		"scopes %s reads to the session organization",
		async (routerName) => {
			const query = vi
				.spyOn(database.$client, "query")
				.mockResolvedValue([[], []]);
			const client = createRouterClient(appRouter, {
				context: contextFor(session),
			});
			await expect(client[routerName].list()).resolves.toEqual([]);
			expect(query).toHaveBeenCalledWith(
				expect.objectContaining({
					sql: expect.stringContaining("organization_id"),
				}),
				expect.arrayContaining([session.session.activeOrganizationId]),
			);
			if (routerName === "connections") {
				expect(query).not.toHaveBeenCalledWith(
					expect.objectContaining({
						sql: expect.stringContaining("encrypted_credentials"),
					}),
					expect.anything(),
				);
			}
			if (routerName === "alerts") {
				expect(query).toHaveBeenCalledWith(
					expect.objectContaining({
						sql: expect.stringContaining("left join `hack_the_andes_incident`"),
					}),
					expect.arrayContaining([ALERT_STATUS_OPEN]),
				);
				expect(query).not.toHaveBeenCalledWith(
					expect.objectContaining({
						sql: expect.stringContaining("`hack_the_andes_incident`.`active`"),
					}),
					expect.anything(),
				);
			}
		},
	);

	it("rejects invalid provider credentials before storing a connection", async () => {
		const query = vi.spyOn(database.$client, "query");
		vi.spyOn(samsaraProvider, "validateCredentials").mockRejectedValue(
			new Error("Provider authentication failed"),
		);
		const client = createRouterClient(appRouter, {
			context: contextFor(session),
		});
		await expect(
			client.connections.create({
				label: "Fleet GPS",
				credentials: { provider: "samsara", apiToken: "test-token" },
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: CREDENTIALS_VALIDATION_FAILED_MESSAGE,
		});
		expect(query).not.toHaveBeenCalled();
	});

	it("rejects another organization's vehicle without routing or cancelling trips", async () => {
		const query = vi
			.spyOn(database.$client, "query")
			.mockResolvedValue([[], []]);
		const fetchRoutes = vi.spyOn(routing, "fetchRouteCandidates");
		const client = createRouterClient(appRouter, {
			context: contextFor(session),
		});
		await expect(client.trips.create(tripInput)).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: VEHICLE_POSITION_REQUIRED_MESSAGE,
		});
		expect(query).toHaveBeenCalledWith(
			expect.objectContaining({
				sql: expect.stringContaining("organization_id"),
			}),
			expect.arrayContaining([
				tripInput.vehicleId,
				session.session.activeOrganizationId,
			]),
		);
		expect(fetchRoutes).not.toHaveBeenCalled();
		expect(query).not.toHaveBeenCalledWith(
			expect.objectContaining({
				sql: expect.stringMatching(/^(insert|update)/),
			}),
			expect.anything(),
		);
	});

	it("rejects a vehicle with no position before requesting a route", async () => {
		vi.spyOn(database.query.vehicle, "findFirst").mockResolvedValue({
			...positionedVehicle,
			lastLat: null,
			lastLng: null,
		});
		const fetchRoutes = vi.spyOn(routing, "fetchRouteCandidates");
		const client = createRouterClient(appRouter, {
			context: contextFor(session),
		});
		await expect(client.trips.create(tripInput)).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: VEHICLE_POSITION_REQUIRED_MESSAGE,
		});
		expect(fetchRoutes).not.toHaveBeenCalled();
	});

	it.each([true, false])(
		"preserves active trips when routing fails (throws: %s)",
		async (routingThrows) => {
			vi.spyOn(database.query.vehicle, "findFirst").mockResolvedValue(
				positionedVehicle,
			);
			const query = vi.spyOn(database.$client, "query");
			const fetchRoutes = vi.spyOn(routing, "fetchRouteCandidates");
			if (routingThrows)
				fetchRoutes.mockRejectedValue(new Error("Routing unavailable"));
			else fetchRoutes.mockResolvedValue([]);
			const context = contextFor(session);
			const client = createRouterClient(appRouter, { context });
			await expect(client.trips.create(tripInput)).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: ROUTING_FAILED_MESSAGE,
			});
			expect(fetchRoutes).toHaveBeenCalledWith({
				baseUrl: context.osrmBaseUrl,
				origin: {
					lat: positionedVehicle.lastLat,
					lng: positionedVehicle.lastLng,
				},
				destination: tripInput.destination,
			});
			expect(query).not.toHaveBeenCalled();
		},
	);
});
