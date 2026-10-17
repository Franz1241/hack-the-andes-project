import {
	ROUTE_CANDIDATE_NOT_FOUND_MESSAGE,
	ROUTE_REVIEW_NOT_FOUND_MESSAGE,
	TRIP_NOT_FOUND_MESSAGE,
	TRIP_STATUS_CANCELLED,
	TRIP_STATUS_PLANNED,
	VEHICLE_NOT_FOUND_MESSAGE,
	VEHICLE_PROFILE_REQUIRED_MESSAGE,
} from "@hack-the-andes-project/api/constants";
import type {
	PlannedTrip,
	PlannedTripSummary,
	ProfiledVehicleSummary,
	RouteReview,
	RouteReviewCandidate,
	RouteReviewInput,
	RouteReviewSegment,
	RouteReviewSignal,
	RouteRiskAssessment,
	TripCandidateChoiceInput,
	TripPlanInput,
	VehicleCreateInput,
	VehicleProfileUpdateInput,
} from "@hack-the-andes-project/api/route-review-schemas";
import { METERS_PER_KM } from "@hack-the-andes-project/business/constants";
import { compareRouteCandidates } from "@hack-the-andes-project/business/route-review/ranking";
import type { RouteRiskLevel } from "@hack-the-andes-project/business/route-review/risk";

import {
	CRITICAL_RISK_MIN_SCORE,
	FIXTURE_GPS_CONNECTION_ID,
	FIXTURE_HORIZONS,
	FIXTURE_LATENCY_MS,
	FIXTURE_ORGANIZATION_ID,
	HIGH_RISK_MIN_SCORE,
	HOUR_MS,
	MINUTE_MS,
	MODERATE_RISK_MIN_SCORE,
} from "./constants";
import limaHuancayoRoutes from "./lima-huancayo-routes.json";
import {
	type FixtureScenario,
	type HorizonScores,
	LIMA_HUANCAYO_SCENARIOS,
} from "./scenarios";

function riskLevelFor(score: number): RouteRiskLevel {
	if (score >= CRITICAL_RISK_MIN_SCORE) return "critical";
	if (score >= HIGH_RISK_MIN_SCORE) return "high";
	if (score >= MODERATE_RISK_MIN_SCORE) return "moderate";
	return "low";
}

function assessRisk(scores: HorizonScores): RouteRiskAssessment[] {
	return FIXTURE_HORIZONS.map((horizon) => ({
		horizon,
		level: riskLevelFor(scores[horizon]),
		score: scores[horizon],
	}));
}

function buildCandidate(
	scenario: FixtureScenario,
	axleCount: number,
	departureAt: Date,
	now: Date,
): RouteReviewCandidate {
	const route = limaHuancayoRoutes[scenario.routeKey];
	const segmentId = (index: number) => `${scenario.id}:${index}`;
	const hoursAfterDeparture = (hours: number | null) =>
		hours === null ? null : new Date(departureAt.getTime() + hours * HOUR_MS);
	const segmentScores = route.segments.map((segment): HorizonScores => {
		const midpointKm = (segment.startM + segment.endM) / 2 / METERS_PER_KM;
		const coveringHotspots = scenario.hotspots.filter(
			(hotspot) => hotspot.fromKm <= midpointKm && midpointKm <= hotspot.toKm,
		);
		return {
			now: Math.max(
				scenario.baseScores.now,
				...coveringHotspots.map((hotspot) => hotspot.scores.now),
			),
			"24h": Math.max(
				scenario.baseScores["24h"],
				...coveringHotspots.map((hotspot) => hotspot.scores["24h"]),
			),
		};
	});
	const segments = route.segments.map(
		(segment, index): RouteReviewSegment => ({
			id: segmentId(index),
			startM: segment.startM,
			endM: segment.endM,
			geometry: { type: "LineString", coordinates: segment.coordinates },
			risk: assessRisk(segmentScores[index]),
		}),
	);
	const signals = scenario.signals.map((signal): RouteReviewSignal => {
		const segmentIndexes = route.segments.flatMap((segment, index) =>
			segment.startM < signal.toKm * METERS_PER_KM &&
			segment.endM > signal.fromKm * METERS_PER_KM
				? [index]
				: [],
		);
		const isConfirmed = signal.kind === "confirmed";
		return {
			id: signal.id,
			kind: signal.kind,
			title: signal.title,
			detail: signal.detail,
			source: signal.source,
			sourceUrl: signal.sourceUrl,
			observedAt: new Date(
				now.getTime() - signal.observedMinutesAgo * MINUTE_MS,
			),
			validFrom: hoursAfterDeparture(signal.validFromHoursAfterDeparture),
			validUntil: hoursAfterDeparture(signal.validUntilHoursAfterDeparture),
			roadStatus: signal.roadStatus,
			incidentId: isConfirmed ? signal.id : null,
			incidentCategory: signal.incidentCategory,
			geometry: isConfirmed
				? {
						type: "Point",
						coordinates:
							route.segments[
								segmentIndexes[Math.floor(segmentIndexes.length / 2)]
							].coordinates[0],
					}
				: null,
			segmentIds: segmentIndexes.map(segmentId),
		};
	});
	return {
		id: scenario.id,
		source: scenario.source,
		name: scenario.name,
		roadCodes: scenario.roadCodes,
		geometry: {
			type: "LineString",
			coordinates: route.segments.flatMap((segment, index) =>
				index === 0 ? segment.coordinates : segment.coordinates.slice(1),
			),
		},
		distanceM: route.distanceM,
		durationS: route.durationS,
		eligibility: {
			eligible:
				scenario.maxAxleCount === null || axleCount <= scenario.maxAxleCount,
			maxAxleCount: scenario.maxAxleCount,
			restriction: scenario.restriction,
		},
		risk: assessRisk({
			now: Math.max(...segmentScores.map((scores) => scores.now)),
			"24h": Math.max(...segmentScores.map((scores) => scores["24h"])),
		}),
		recommendation: {
			action: scenario.recommendation.action,
			rule: scenario.recommendation.rule,
			suggestedDepartureAt: hoursAfterDeparture(
				scenario.recommendation.suggestedDelayHours,
			),
			expectedDelayS: scenario.recommendation.expectedDelayS,
		},
		segments,
		signals,
		explanation: scenario.explanation,
	};
}

const seededAt = new Date();
const vehicleDefaults = {
	organizationId: FIXTURE_ORGANIZATION_ID,
	lastHeading: null,
	lastSpeedKmh: null,
	active: true,
	createdAt: seededAt,
	updatedAt: seededAt,
	activeTrip: null,
};
const gpsVehicleDefaults = {
	...vehicleDefaults,
	connectionId: FIXTURE_GPS_CONNECTION_ID,
	provider: "demo" as const,
	lastLat: -12.0553,
	lastLng: -77.1186,
	lastPositionAt: new Date(seededAt.getTime() - 3 * MINUTE_MS),
};
const manualVehicleDefaults = {
	...vehicleDefaults,
	connectionId: null,
	provider: null,
	externalId: null,
	lastLat: null,
	lastLng: null,
	lastPositionAt: null,
};

const vehicles: ProfiledVehicleSummary[] = [
	{
		...gpsVehicleDefaults,
		id: "fixture-vehicle-volvo-fh",
		externalId: "demo-truck-1",
		name: "Volvo FH 540",
		plate: "F7K-829",
		profile: { vehicleTypeId: "t3s3", axleCount: 6, grossWeightKg: 48_000 },
	},
	{
		...gpsVehicleDefaults,
		id: "fixture-vehicle-scania-r450",
		externalId: "demo-truck-2",
		name: "Scania R450",
		plate: "C4P-512",
		profile: { vehicleTypeId: "t2s3", axleCount: 5, grossWeightKg: 43_000 },
	},
	{
		...gpsVehicleDefaults,
		id: "fixture-vehicle-actros",
		externalId: "demo-truck-3",
		name: "Mercedes-Benz Actros",
		plate: "A3R-118",
		profile: null,
	},
	{
		...manualVehicleDefaults,
		id: "fixture-vehicle-hino-500",
		name: "Hino 500",
		plate: "B9X-301",
		profile: { vehicleTypeId: "c3", axleCount: 3, grossWeightKg: 25_000 },
	},
	{
		...manualVehicleDefaults,
		id: "fixture-vehicle-isuzu-nqr",
		name: "Isuzu NQR furgón",
		plate: "D2M-774",
		profile: { vehicleTypeId: "c2", axleCount: 2, grossWeightKg: 12_000 },
	},
];
const reviews = new Map<string, RouteReview>();
const plannedTrips: PlannedTripSummary[] = [];
const tripReviewIds = new Map<string, string>();

function findVehicle(id: string) {
	const vehicle = vehicles.find((candidate) => candidate.id === id);
	if (!vehicle) throw new Error(VEHICLE_NOT_FOUND_MESSAGE);
	return vehicle;
}

function findTrip(id: string) {
	const trip = plannedTrips.find((candidate) => candidate.id === id);
	if (!trip) throw new Error(TRIP_NOT_FOUND_MESSAGE);
	return trip;
}

function findCandidate(review: RouteReview, candidateId: string) {
	const candidate = review.candidates.find(({ id }) => id === candidateId);
	if (!candidate) throw new Error(ROUTE_CANDIDATE_NOT_FOUND_MESSAGE);
	return candidate;
}

function evaluate(input: RouteReviewInput): RouteReview {
	const profile = findVehicle(input.vehicleId).profile;
	if (!profile) throw new Error(VEHICLE_PROFILE_REQUIRED_MESSAGE);
	const now = new Date();
	const scenarios =
		input.originPlaceId === "lima" && input.destinationPlaceId === "huancayo"
			? LIMA_HUANCAYO_SCENARIOS
			: [];
	const candidates = scenarios.map((scenario) =>
		buildCandidate(scenario, profile.axleCount, input.departureAt, now),
	);
	const [recommendedCandidate] = candidates
		.filter((candidate) => candidate.eligibility.eligible)
		.toSorted(compareRouteCandidates);
	const review: RouteReview = {
		id: crypto.randomUUID(),
		originPlaceId: input.originPlaceId,
		destinationPlaceId: input.destinationPlaceId,
		vehicleId: input.vehicleId,
		vehicleAxleCount: profile.axleCount,
		departureAt: input.departureAt,
		horizons: [...FIXTURE_HORIZONS],
		recommendedCandidateId: recommendedCandidate?.id ?? null,
		candidates,
		evaluatedAt: now,
	};
	reviews.set(review.id, review);
	return review;
}

function summarizeCandidate({
	id,
	source,
	name,
	distanceM,
	durationS,
	risk,
	recommendation,
}: RouteReviewCandidate): PlannedTripSummary["chosenCandidate"] {
	return { id, source, name, distanceM, durationS, risk, recommendation };
}

function plan(input: TripPlanInput): PlannedTripSummary {
	const review = reviews.get(input.reviewId);
	if (!review) throw new Error(ROUTE_REVIEW_NOT_FOUND_MESSAGE);
	const trip: PlannedTripSummary = {
		id: crypto.randomUUID(),
		vehicleId: review.vehicleId,
		vehicleName: findVehicle(review.vehicleId).name,
		name: input.name,
		originPlaceId: review.originPlaceId,
		destinationPlaceId: review.destinationPlaceId,
		departureAt: review.departureAt,
		status: TRIP_STATUS_PLANNED,
		chosenCandidate: summarizeCandidate(
			findCandidate(review, input.candidateId),
		),
		lastEvaluatedAt: review.evaluatedAt,
		createdAt: new Date(),
	};
	plannedTrips.push(trip);
	tripReviewIds.set(trip.id, review.id);
	return trip;
}

function tripDetail(trip: PlannedTripSummary): PlannedTrip {
	const review = reviews.get(tripReviewIds.get(trip.id) ?? "");
	if (!review) throw new Error(ROUTE_REVIEW_NOT_FOUND_MESSAGE);
	return { ...trip, review };
}

const nextHour = Math.ceil(seededAt.getTime() / HOUR_MS) * HOUR_MS;
for (const seed of [
	{
		vehicleId: "fixture-vehicle-volvo-fh",
		departureInHours: 6,
		candidateId: "sutran:carretera_central_ruta_5",
		name: "Lima → Huancayo · cemento",
		cancelled: false,
	},
	{
		vehicleId: "fixture-vehicle-volvo-fh",
		departureInHours: 22,
		candidateId: "illapa:pe22_central",
		name: "Lima → Huancayo · retorno de vacíos",
		cancelled: false,
	},
	{
		vehicleId: "fixture-vehicle-scania-r450",
		departureInHours: 20,
		candidateId: "illapa:pe22_central",
		name: "Lima → Huancayo · abarrotes",
		cancelled: false,
	},
	{
		vehicleId: "fixture-vehicle-isuzu-nqr",
		departureInHours: 3,
		candidateId: "sutran:carretera_central_ruta_4",
		name: "Lima → Huancayo · reparto farmacias",
		cancelled: false,
	},
	{
		vehicleId: "fixture-vehicle-hino-500",
		departureInHours: 10,
		candidateId: "sutran:carretera_central_ruta_2",
		name: "Lima → Huancayo · fertilizantes",
		cancelled: true,
	},
]) {
	const review = evaluate({
		originPlaceId: "lima",
		destinationPlaceId: "huancayo",
		vehicleId: seed.vehicleId,
		departureAt: new Date(nextHour + seed.departureInHours * HOUR_MS),
	});
	const trip = plan({
		reviewId: review.id,
		candidateId: seed.candidateId,
		name: seed.name,
	});
	if (seed.cancelled) trip.status = TRIP_STATUS_CANCELLED;
}

async function respond<Result>(produce: () => Result): Promise<Result> {
	await new Promise((resolve) => setTimeout(resolve, FIXTURE_LATENCY_MS));
	return structuredClone(produce());
}

export const routeReviewFixtureClient = {
	routeReview: {
		evaluate: (input: RouteReviewInput) => respond(() => evaluate(input)),
	},
	vehicles: {
		list: () =>
			respond(() =>
				vehicles.toSorted((first, second) =>
					first.name.localeCompare(second.name),
				),
			),
		create: (input: VehicleCreateInput) =>
			respond(() => {
				const createdAt = new Date();
				const vehicle: ProfiledVehicleSummary = {
					...manualVehicleDefaults,
					id: crypto.randomUUID(),
					name: input.name,
					plate: input.plate,
					profile: {
						vehicleTypeId: input.vehicleTypeId,
						axleCount: input.axleCount,
						grossWeightKg: input.grossWeightKg,
					},
					createdAt,
					updatedAt: createdAt,
				};
				vehicles.push(vehicle);
				return vehicle;
			}),
		updateProfile: (input: VehicleProfileUpdateInput) =>
			respond(() => {
				const vehicle = findVehicle(input.id);
				vehicle.profile = {
					vehicleTypeId: input.vehicleTypeId,
					axleCount: input.axleCount,
					grossWeightKg: input.grossWeightKg,
				};
				vehicle.updatedAt = new Date();
				return vehicle;
			}),
	},
	trips: {
		listPlanned: () =>
			respond(() =>
				plannedTrips.toSorted(
					(first, second) =>
						first.departureAt.getTime() - second.departureAt.getTime(),
				),
			),
		get: (input: { id: string }) =>
			respond(() => tripDetail(findTrip(input.id))),
		plan: (input: TripPlanInput) => respond(() => plan(input)),
		reevaluate: (input: { id: string }) =>
			respond(() => {
				const trip = findTrip(input.id);
				const review = evaluate({
					originPlaceId: trip.originPlaceId,
					destinationPlaceId: trip.destinationPlaceId,
					vehicleId: trip.vehicleId,
					departureAt: trip.departureAt,
				});
				const chosenCandidate =
					review.candidates.find(
						(candidate) => candidate.id === trip.chosenCandidate.id,
					) ?? findCandidate(review, review.recommendedCandidateId ?? "");
				trip.chosenCandidate = summarizeCandidate(chosenCandidate);
				trip.lastEvaluatedAt = review.evaluatedAt;
				tripReviewIds.set(trip.id, review.id);
				return tripDetail(trip);
			}),
		chooseCandidate: (input: TripCandidateChoiceInput) =>
			respond(() => {
				const trip = findTrip(input.id);
				trip.chosenCandidate = summarizeCandidate(
					findCandidate(tripDetail(trip).review, input.candidateId),
				);
				return tripDetail(trip);
			}),
		cancel: (input: { id: string }) =>
			respond(() => {
				const trip = findTrip(input.id);
				trip.status = TRIP_STATUS_CANCELLED;
				return { id: trip.id, status: trip.status };
			}),
	},
};
