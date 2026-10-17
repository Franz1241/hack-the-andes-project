import { MS_PER_SECOND } from "@hack-the-andes-project/business/constants";
import { resolveObsoleteAlerts } from "@hack-the-andes-project/business/fleet/resolve-obsolete-alerts";
import { fetchRouteCandidates } from "@hack-the-andes-project/business/routing/osrm";
import {
	alert,
	TRIP_STATUSES,
	type TripStatus,
	trip,
	vehicle,
} from "@hack-the-andes-project/db/schema/fleet";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, getColumns } from "drizzle-orm";
import { z } from "zod";

import {
	ALERT_STATUS_OPEN,
	ROUTING_FAILED_MESSAGE,
	TRIP_NOT_ACTIVE_MESSAGE,
	TRIP_NOT_FOUND_MESSAGE,
	TRIP_STATUS_ACTIVE,
	TRIP_STATUS_CANCELLED,
	TRIP_STATUS_COMPLETED,
	VEHICLE_POSITION_REQUIRED_MESSAGE,
} from "../constants";
import type { OrganizationContext } from "../context";
import { organizationProcedure } from "../index";
import {
	entityIdInputSchema,
	fleetIdSchema,
	fleetNameSchema,
	latLngSchema,
	tripSchema,
	tripStatusSchema,
	tripSummarySchema,
} from "../schemas";

async function finishTrip(
	context: OrganizationContext,
	tripId: string,
	status: Exclude<TripStatus, typeof TRIP_STATUS_ACTIVE>,
) {
	await context.db
		.update(trip)
		.set({ status })
		.where(
			and(
				eq(trip.id, tripId),
				eq(trip.organizationId, context.organizationId),
				eq(trip.status, TRIP_STATUS_ACTIVE),
			),
		);
	const finishedTrip = await context.db.query.trip.findFirst({
		columns: { id: true, status: true },
		where: { id: tripId, organizationId: context.organizationId },
	});
	if (!finishedTrip)
		throw new ORPCError("NOT_FOUND", { message: TRIP_NOT_FOUND_MESSAGE });
	if (finishedTrip.status !== status)
		throw new ORPCError("BAD_REQUEST", { message: TRIP_NOT_ACTIVE_MESSAGE });
	await resolveObsoleteAlerts({
		db: context.db,
		organizationId: context.organizationId,
		now: new Date(),
	});
	context.log.set({
		fleet: { organizationId: context.organizationId, tripId, status },
	});
	return finishedTrip;
}

export const tripsRouter = {
	list: organizationProcedure
		.input(z.object({ status: z.enum(TRIP_STATUSES).optional() }).default({}))
		.output(z.array(tripSummarySchema))
		.handler(async ({ context, input }) => {
			const trips = await context.db
				.select({
					...getColumns(trip),
					vehicleName: vehicle.name,
					openAlertCount: context.db.$count(
						alert,
						and(
							eq(alert.tripId, trip.id),
							eq(alert.organizationId, context.organizationId),
							eq(alert.status, ALERT_STATUS_OPEN),
						),
					),
				})
				.from(trip)
				.leftJoin(
					vehicle,
					and(
						eq(vehicle.id, trip.vehicleId),
						eq(vehicle.organizationId, context.organizationId),
					),
				)
				.where(
					and(
						eq(trip.organizationId, context.organizationId),
						input.status ? eq(trip.status, input.status) : undefined,
					),
				)
				.orderBy(desc(trip.createdAt), desc(trip.id));
			context.log.set({
				fleet: {
					organizationId: context.organizationId,
					tripsListed: trips.length,
					status: input.status,
				},
			});
			return trips;
		}),
	create: organizationProcedure
		.input(
			z.object({
				vehicleId: fleetIdSchema,
				name: fleetNameSchema,
				destination: latLngSchema,
				destinationName: fleetNameSchema.optional(),
			}),
		)
		.output(tripSchema)
		.handler(async ({ context, input }) => {
			const selectedVehicle = await context.db.query.vehicle.findFirst({
				columns: { id: true, lastLat: true, lastLng: true },
				where: { id: input.vehicleId, organizationId: context.organizationId },
			});
			if (
				!selectedVehicle ||
				selectedVehicle.lastLat === null ||
				selectedVehicle.lastLng === null
			) {
				throw new ORPCError("BAD_REQUEST", {
					message: VEHICLE_POSITION_REQUIRED_MESSAGE,
				});
			}
			context.log.set({
				fleet: {
					organizationId: context.organizationId,
					vehicleId: input.vehicleId,
				},
			});
			const [primaryRoute] = await fetchRouteCandidates({
				baseUrl: context.osrmBaseUrl,
				origin: { lat: selectedVehicle.lastLat, lng: selectedVehicle.lastLng },
				destination: input.destination,
			}).catch((cause: unknown) => {
				throw new ORPCError("BAD_REQUEST", {
					message: ROUTING_FAILED_MESSAGE,
					cause,
				});
			});
			if (!primaryRoute)
				throw new ORPCError("BAD_REQUEST", { message: ROUTING_FAILED_MESSAGE });
			const createdAt = new Date();
			const createdTrip: typeof trip.$inferSelect = {
				id: crypto.randomUUID(),
				organizationId: context.organizationId,
				vehicleId: input.vehicleId,
				name: input.name,
				originLat: selectedVehicle.lastLat,
				originLng: selectedVehicle.lastLng,
				destinationLat: input.destination.lat,
				destinationLng: input.destination.lng,
				destinationName:
					input.destinationName ??
					`${input.destination.lat}, ${input.destination.lng}`,
				routeGeometry: primaryRoute.geometry,
				routeDistanceM: primaryRoute.distanceM,
				routeDurationS: primaryRoute.durationS,
				status: TRIP_STATUS_ACTIVE,
				etaAt: new Date(
					createdAt.getTime() + primaryRoute.durationS * MS_PER_SECOND,
				),
				lastEvaluatedAt: null,
				createdAt,
				updatedAt: createdAt,
			};
			const [cancelledTrips] = await context.db
				.update(trip)
				.set({ status: TRIP_STATUS_CANCELLED })
				.where(
					and(
						eq(trip.vehicleId, input.vehicleId),
						eq(trip.organizationId, context.organizationId),
						eq(trip.status, TRIP_STATUS_ACTIVE),
					),
				);
			await context.db.insert(trip).values(createdTrip);
			await resolveObsoleteAlerts({
				db: context.db,
				organizationId: context.organizationId,
				now: createdAt,
			});
			context.log.set({
				fleet: {
					tripId: createdTrip.id,
					tripsCancelled: cancelledTrips.affectedRows,
					routeDistanceM: primaryRoute.distanceM,
					routeDurationS: primaryRoute.durationS,
				},
			});
			return createdTrip;
		}),
	cancel: organizationProcedure
		.input(entityIdInputSchema)
		.output(tripStatusSchema)
		.handler(({ context, input }) =>
			finishTrip(context, input.id, TRIP_STATUS_CANCELLED),
		),
	complete: organizationProcedure
		.input(entityIdInputSchema)
		.output(tripStatusSchema)
		.handler(({ context, input }) =>
			finishTrip(context, input.id, TRIP_STATUS_COMPLETED),
		),
};
