import { z } from "zod";

import { SINGLE_RESULT_LIMIT_ROWS, TRIP_STATUS_ACTIVE } from "../constants";
import { organizationProcedure } from "../index";
import { vehicleSummarySchema } from "../schemas";

export const vehiclesRouter = {
	list: organizationProcedure
		.input(z.void())
		.output(z.array(vehicleSummarySchema))
		.handler(async ({ context }) => {
			const vehicles = await context.db.query.vehicle.findMany({
				where: { organizationId: context.organizationId },
				orderBy: { name: "asc", id: "asc" },
				with: {
					connection: { columns: { provider: true } },
					trips: {
						columns: {
							id: true,
							name: true,
							destinationName: true,
							etaAt: true,
							status: true,
						},
						where: {
							organizationId: context.organizationId,
							status: TRIP_STATUS_ACTIVE,
						},
						orderBy: { createdAt: "desc", id: "desc" },
						limit: SINGLE_RESULT_LIMIT_ROWS,
					},
				},
			});
			context.log.set({
				fleet: {
					organizationId: context.organizationId,
					vehiclesListed: vehicles.length,
				},
			});
			return vehicles.map(({ connection, trips, ...vehicle }) => {
				const [activeTrip] = trips;
				return {
					...vehicle,
					provider: connection?.provider ?? null,
					activeTrip: activeTrip ?? null,
				};
			});
		}),
};
