import type { Database } from "@hack-the-andes-project/db";
import {
	alert,
	gpsConnection,
	trip,
	vehicle,
	vehiclePosition,
} from "@hack-the-andes-project/db/schema/fleet";
import { eq, inArray } from "drizzle-orm";
import type { RequestLogger } from "evlog";

import { DEMO_TRIP_SCENARIOS } from "./constants";
import { demoEntityId, ensureDemoConnection } from "./demo-fleet";
import { createFleetTrip } from "./fleet/create-trip";
import { loadAlertableIncidents } from "./fleet/load-alertable-incidents";
import { planDemoTrip } from "./fleet/plan-demo-trip";
import { DEMO_CLEAR_VEHICLE_EXTERNAL_ID } from "./providers/constants";
import { fetchRouteCandidates } from "./routing/osrm";

export interface PrepareDemoInput {
	db: Database;
	organizationId: string;
	encryptionKey: string;
	osrmBaseUrl: string;
	log: RequestLogger;
}

export async function prepareDemo(input: PrepareDemoInput) {
	const { db, organizationId, log } = input;
	const existingConnection = await db.query.gpsConnection.findFirst({
		where: { organizationId, provider: "demo" },
	});
	const connection =
		existingConnection ??
		(await ensureDemoConnection({ ...input, label: "Flota demo" }));
	let vehicles: Array<typeof vehicle.$inferSelect> | undefined;
	for (const scenario of DEMO_TRIP_SCENARIOS) {
		const tripId = await demoEntityId(organizationId, `trip:${scenario}`);
		const existingTrip = await db.query.trip.findFirst({
			where: { id: tripId, organizationId },
		});
		if (existingTrip) continue;
		try {
			vehicles ??= await db.query.vehicle.findMany({
				where: { organizationId, connectionId: connection.id },
				orderBy: { externalId: "asc" },
			});
			const incidents = await loadAlertableIncidents(db);
			for (const selectedVehicle of vehicles) {
				if (
					(scenario === "clear") !==
						(selectedVehicle.externalId === DEMO_CLEAR_VEHICLE_EXTERNAL_ID) ||
					selectedVehicle.lastLat === null ||
					selectedVehicle.lastLng === null
				)
					continue;
				const origin = {
					lat: selectedVehicle.lastLat,
					lng: selectedVehicle.lastLng,
				};
				const plan = await planDemoTrip({
					osrmBaseUrl: input.osrmBaseUrl,
					origin,
					scenario,
					incidents,
				});
				if (!plan) continue;
				const [route] = await fetchRouteCandidates({
					baseUrl: input.osrmBaseUrl,
					origin,
					destination: plan.destination,
				});
				if (!route) continue;
				await createFleetTrip({
					db,
					organizationId,
					vehicleId: selectedVehicle.id,
					tripId,
					preserveExisting: true,
					name:
						scenario === "hazard"
							? "Demo: ruta con peligro"
							: "Demo: ruta despejada",
					origin,
					destination: plan.destination,
					destinationName: plan.incident?.title,
					route,
				});
				break;
			}
		} catch {
			log.set({ demo: { tripPlanningFailed: true, scenario } });
		}
	}
	return {
		vehicleCount: await db.$count(
			vehicle,
			eq(vehicle.organizationId, organizationId),
		),
		tripCount: await db.$count(trip, eq(trip.organizationId, organizationId)),
	};
}

export async function wipeDemoFleet(db: Database, organizationId: string) {
	await db.delete(alert).where(eq(alert.organizationId, organizationId));
	await db.delete(trip).where(eq(trip.organizationId, organizationId));
	await db
		.delete(vehiclePosition)
		.where(
			inArray(
				vehiclePosition.vehicleId,
				db
					.select({ id: vehicle.id })
					.from(vehicle)
					.where(eq(vehicle.organizationId, organizationId)),
			),
		);
	await db.delete(vehicle).where(eq(vehicle.organizationId, organizationId));
	await db
		.delete(gpsConnection)
		.where(eq(gpsConnection.organizationId, organizationId));
}
