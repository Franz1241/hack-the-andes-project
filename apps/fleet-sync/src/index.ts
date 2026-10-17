import {
	type EvaluateTripResult,
	evaluateTrip,
	isAlertableIncident,
	type SyncConnectionResult,
	syncConnection,
} from "@hack-the-andes-project/business";
import { createDb } from "@hack-the-andes-project/db";
import {
	gpsConnection,
	trip,
	vehicle,
} from "@hack-the-andes-project/db/schema/fleet";
import { incident } from "@hack-the-andes-project/db/schema/scraper";
import { and, eq } from "drizzle-orm";
import { createLogger } from "evlog";
import { initWorkersLogger } from "evlog/workers";

import { HTTP_STATUS, RUN_SECRET_HEADER, SERVICE_NAME } from "./constants";
import { ENV } from "./env.server";

initWorkersLogger({
	env: {
		service: SERVICE_NAME,
		environment: ENV.APP_ENV,
		version: ENV.SERVICE_VERSION,
	},
});

interface RunSummary {
	ok: boolean;
	connections: SyncConnectionResult[];
	trips: EvaluateTripResult[];
	error?: string;
}

async function syncAll(
	trigger: string,
	connectionId?: string,
): Promise<RunSummary> {
	const log = createLogger({ job: "fleet-sync", trigger, connectionId });
	const summary: RunSummary = { ok: false, connections: [], trips: [] };
	const now = new Date();
	try {
		const db = await createDb(ENV.HYPERDRIVE);
		try {
			const connections = await db
				.select()
				.from(gpsConnection)
				.where(
					connectionId
						? eq(gpsConnection.id, connectionId)
						: eq(gpsConnection.status, "active"),
				);
			if (connectionId && connections.length === 0) {
				summary.error = "unknown_connection";
				return summary;
			}
			const connectionOutcomes = await Promise.allSettled(
				connections.map((connection) =>
					syncConnection({
						db,
						encryptionKey: ENV.CREDENTIALS_ENCRYPTION_KEY,
						connection,
						now,
						log,
					}),
				),
			);
			summary.connections = connectionOutcomes.map((outcome, index) =>
				outcome.status === "fulfilled"
					? outcome.value
					: {
							connectionId: connections[index]?.id ?? "unknown",
							ok: false,
							vehiclesSynced: 0,
							positionsInserted: 0,
							error:
								"No se pudo guardar el resultado de la sincronización GPS.",
						},
			);
			const [activeTrips, activeIncidents] = await Promise.all([
				db
					.select({ trip, vehicle })
					.from(trip)
					.innerJoin(
						vehicle,
						and(
							eq(trip.vehicleId, vehicle.id),
							eq(trip.organizationId, vehicle.organizationId),
						),
					)
					.where(
						and(
							eq(trip.status, "active"),
							connectionId ? eq(vehicle.connectionId, connectionId) : undefined,
						),
					),
				db
					.select({
						id: incident.id,
						category: incident.category,
						severity: incident.severity,
						title: incident.title,
						geometry: incident.geometry,
						lat: incident.lat,
						lng: incident.lng,
					})
					.from(incident)
					.where(eq(incident.active, true)),
			]);
			const incidents = activeIncidents.filter(isAlertableIncident);
			const tripOutcomes = await Promise.allSettled(
				activeTrips.map((entry) =>
					evaluateTrip({
						db,
						osrmBaseUrl: ENV.OSRM_BASE_URL,
						trip: entry.trip,
						vehicle: entry.vehicle,
						incidents,
						now,
						log,
					}),
				),
			);
			summary.trips = tripOutcomes.map((outcome, index) =>
				outcome.status === "fulfilled"
					? outcome.value
					: {
							tripId: activeTrips[index]?.trip.id ?? "unknown",
							ok: false,
							completed: false,
							rerouted: false,
							alertsCreated: 0,
							alertsUpdated: 0,
							alertsResolved: 0,
							error: "No se pudo evaluar el viaje.",
						},
			);
			summary.ok =
				summary.connections.every((result) => result.ok) &&
				summary.trips.every((result) => result.ok);
		} finally {
			await db.$client.end();
		}
	} catch {
		summary.ok = false;
		summary.error = "No se pudo completar la sincronización de la flota.";
	} finally {
		log.set({ run: summary });
		if (!summary.ok) log.setLevel("error");
		log.emit();
	}
	return summary;
}

export default {
	async scheduled(
		controller: ScheduledController,
		_env: Env,
		context: ExecutionContext,
	) {
		context.waitUntil(syncAll(`cron:${controller.cron}`));
	},
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") return new Response("OK");
		if (url.pathname !== "/run" || request.method !== "POST") {
			return Response.json(
				{ error: "not_found" },
				{ status: HTTP_STATUS.NOT_FOUND },
			);
		}
		if (
			!ENV.FLEET_SYNC_RUN_SECRET ||
			request.headers.get(RUN_SECRET_HEADER) !== ENV.FLEET_SYNC_RUN_SECRET
		) {
			return Response.json(
				{ error: "unauthorized" },
				{ status: HTTP_STATUS.UNAUTHORIZED },
			);
		}
		const summary = await syncAll(
			"manual",
			url.searchParams.get("connection") ?? undefined,
		);
		const status = summary.ok
			? HTTP_STATUS.OK
			: summary.error === "unknown_connection"
				? HTTP_STATUS.NOT_FOUND
				: HTTP_STATUS.INTERNAL_SERVER_ERROR;
		return Response.json(summary, { status });
	},
};
