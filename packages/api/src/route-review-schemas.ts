import {
	MAX_ROUTE_RISK_SCORE,
	MAX_VEHICLE_AXLE_COUNT,
	MIN_ROUTE_RISK_SCORE,
	MIN_VEHICLE_AXLE_COUNT,
} from "@hack-the-andes-project/business/constants";
import { ROUTE_REVIEW_PLACE_IDS } from "@hack-the-andes-project/business/route-review/places";
import {
	ROUTE_CANDIDATE_SOURCES,
	ROUTE_RECOMMENDATION_RULES,
	ROUTE_RECOMMENDATIONS,
	ROUTE_RISK_HORIZONS,
	ROUTE_RISK_LEVELS,
	ROUTE_SIGNAL_KINDS,
} from "@hack-the-andes-project/business/route-review/risk";
import { VEHICLE_TYPE_IDS } from "@hack-the-andes-project/business/route-review/vehicle-types";
import { VEHICLE_PLATE_LENGTH_CHARS } from "@hack-the-andes-project/db/schema/constants";
import { TRIP_STATUSES } from "@hack-the-andes-project/db/schema/fleet";
import {
	INCIDENT_CATEGORIES,
	ROAD_STATUSES,
} from "@hack-the-andes-project/db/schema/scraper";
import { z } from "zod";

import {
	MIN_FLEET_TEXT_LENGTH_CHARS,
	SAME_ORIGIN_AND_DESTINATION_MESSAGE,
	TRIP_STATUS_PLANNED,
} from "./constants";
import {
	fleetIdSchema,
	fleetNameSchema,
	geometrySchema,
	lineStringSchema,
	vehicleSummarySchema,
} from "./schemas";

const placeIdSchema = z.enum(ROUTE_REVIEW_PLACE_IDS);

export const routeRiskAssessmentSchema = z.object({
	horizon: z.enum(ROUTE_RISK_HORIZONS),
	level: z.enum(ROUTE_RISK_LEVELS),
	score: z.number().min(MIN_ROUTE_RISK_SCORE).max(MAX_ROUTE_RISK_SCORE),
});

export const routeRecommendationSchema = z.object({
	action: z.enum(ROUTE_RECOMMENDATIONS),
	rule: z.enum(ROUTE_RECOMMENDATION_RULES),
	suggestedDepartureAt: z.date().nullable(),
	expectedDelayS: z.number().nonnegative().nullable(),
});

export const routeSignalSchema = z.object({
	id: z.string(),
	kind: z.enum(ROUTE_SIGNAL_KINDS),
	title: z.string(),
	detail: z.string().nullable(),
	source: z.string(),
	sourceUrl: z.url().nullable(),
	observedAt: z.date(),
	validFrom: z.date().nullable(),
	validUntil: z.date().nullable(),
	roadStatus: z.enum(ROAD_STATUSES).nullable(),
	incidentId: z.string().nullable(),
	incidentCategory: z.enum(INCIDENT_CATEGORIES).nullable(),
	geometry: geometrySchema.nullable(),
	segmentIds: z.array(z.string()),
});

export const routeSegmentSchema = z.object({
	id: z.string(),
	startM: z.number().nonnegative(),
	endM: z.number().nonnegative(),
	geometry: lineStringSchema,
	risk: z.array(routeRiskAssessmentSchema),
});

export const routeCandidateSchema = z.object({
	id: z.string(),
	source: z.enum(ROUTE_CANDIDATE_SOURCES),
	name: z.string(),
	roadCodes: z.array(z.string()),
	geometry: lineStringSchema,
	distanceM: z.number().nonnegative(),
	durationS: z.number().nonnegative(),
	eligibility: z.object({
		eligible: z.boolean(),
		maxAxleCount: z.number().int().positive().nullable(),
		restriction: z.string().nullable(),
	}),
	risk: z.array(routeRiskAssessmentSchema),
	recommendation: routeRecommendationSchema,
	segments: z.array(routeSegmentSchema),
	signals: z.array(routeSignalSchema),
	explanation: z.string().nullable(),
});

export const routeReviewInputSchema = z
	.object({
		originPlaceId: placeIdSchema,
		destinationPlaceId: placeIdSchema,
		vehicleId: fleetIdSchema,
		departureAt: z.date(),
	})
	.refine((input) => input.originPlaceId !== input.destinationPlaceId, {
		message: SAME_ORIGIN_AND_DESTINATION_MESSAGE,
	});

export const routeReviewSchema = z.object({
	id: z.string(),
	originPlaceId: placeIdSchema,
	destinationPlaceId: placeIdSchema,
	vehicleId: z.string(),
	vehicleAxleCount: z.number().int().positive(),
	departureAt: z.date(),
	horizons: z.array(z.enum(ROUTE_RISK_HORIZONS)),
	recommendedCandidateId: z.string().nullable(),
	candidates: z.array(routeCandidateSchema),
	evaluatedAt: z.date(),
});

export const vehicleProfileSchema = z.object({
	vehicleTypeId: z.enum(VEHICLE_TYPE_IDS),
	axleCount: z
		.number()
		.int()
		.min(MIN_VEHICLE_AXLE_COUNT)
		.max(MAX_VEHICLE_AXLE_COUNT),
	grossWeightKg: z.number().positive().nullable(),
});

export const vehicleCreateInputSchema = vehicleProfileSchema.extend({
	name: fleetNameSchema,
	plate: z
		.string()
		.min(MIN_FLEET_TEXT_LENGTH_CHARS)
		.max(VEHICLE_PLATE_LENGTH_CHARS)
		.nullable(),
});

export const vehicleProfileUpdateInputSchema = vehicleProfileSchema.extend({
	id: fleetIdSchema,
});

export const profiledVehicleSummarySchema = vehicleSummarySchema.extend({
	connectionId: z.string().nullable(),
	externalId: z.string().nullable(),
	profile: vehicleProfileSchema.nullable(),
});

export const tripPlanInputSchema = z.object({
	reviewId: fleetIdSchema,
	candidateId: z.string(),
	name: fleetNameSchema,
});

export const tripCandidateChoiceInputSchema = z.object({
	id: fleetIdSchema,
	candidateId: z.string(),
});

export const plannedTripSummarySchema = z.object({
	id: z.string(),
	vehicleId: z.string(),
	vehicleName: z.string().nullable(),
	name: z.string(),
	originPlaceId: placeIdSchema,
	destinationPlaceId: placeIdSchema,
	departureAt: z.date(),
	status: z.enum([TRIP_STATUS_PLANNED, ...TRIP_STATUSES]),
	chosenCandidate: routeCandidateSchema.pick({
		id: true,
		source: true,
		name: true,
		distanceM: true,
		durationS: true,
		risk: true,
		recommendation: true,
	}),
	lastEvaluatedAt: z.date(),
	createdAt: z.date(),
});

export const plannedTripSchema = plannedTripSummarySchema.extend({
	review: routeReviewSchema,
});

export interface RouteRiskAssessment
	extends z.infer<typeof routeRiskAssessmentSchema> {}
export interface RouteReviewSignal extends z.infer<typeof routeSignalSchema> {}
export interface RouteReviewSegment
	extends z.infer<typeof routeSegmentSchema> {}
export interface RouteReviewCandidate
	extends z.infer<typeof routeCandidateSchema> {}
export interface RouteReviewInput
	extends z.infer<typeof routeReviewInputSchema> {}
export interface RouteReview extends z.infer<typeof routeReviewSchema> {}
export interface VehicleProfile extends z.infer<typeof vehicleProfileSchema> {}
export interface VehicleCreateInput
	extends z.infer<typeof vehicleCreateInputSchema> {}
export interface VehicleProfileUpdateInput
	extends z.infer<typeof vehicleProfileUpdateInputSchema> {}
export interface ProfiledVehicleSummary
	extends z.infer<typeof profiledVehicleSummarySchema> {}
export interface TripPlanInput extends z.infer<typeof tripPlanInputSchema> {}
export interface TripCandidateChoiceInput
	extends z.infer<typeof tripCandidateChoiceInputSchema> {}
export interface PlannedTripSummary
	extends z.infer<typeof plannedTripSummarySchema> {}
export interface PlannedTrip extends z.infer<typeof plannedTripSchema> {}
