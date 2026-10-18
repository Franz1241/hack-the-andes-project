import type { Database } from "@hack-the-andes-project/db";
import {
	type gpsConnection,
	vehicle,
} from "@hack-the-andes-project/db/schema/fleet";

import { FLEET_WRITE_BATCH_SIZE_ROWS } from "../constants";
import type { ProviderVehicle } from "../providers/types";
import { incomingValue } from "./sql";

export interface ImportFleetVehiclesInput {
	db: Database;
	connection: typeof gpsConnection.$inferSelect;
	vehicles: ProviderVehicle[];
	vehicleIdFor?: (externalId: string) => string | Promise<string>;
}

export async function importFleetVehicles({
	db,
	connection,
	vehicles,
	vehicleIdFor,
}: ImportFleetVehiclesInput) {
	for (
		let offset = 0;
		offset < vehicles.length;
		offset += FLEET_WRITE_BATCH_SIZE_ROWS
	) {
		const records = await Promise.all(
			vehicles
				.slice(offset, offset + FLEET_WRITE_BATCH_SIZE_ROWS)
				.map(async (providerVehicle) => ({
					id: vehicleIdFor
						? await vehicleIdFor(providerVehicle.externalId)
						: crypto.randomUUID(),
					organizationId: connection.organizationId,
					connectionId: connection.id,
					externalId: providerVehicle.externalId,
					name: providerVehicle.name,
					plate: providerVehicle.plate,
					active: true,
				})),
		);
		await db
			.insert(vehicle)
			.values(records)
			.onDuplicateKeyUpdate({
				set: {
					name: incomingValue(vehicle.name),
					plate: incomingValue(vehicle.plate),
					active: true,
				},
			});
	}
}
