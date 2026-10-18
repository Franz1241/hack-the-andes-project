import {
	RISK_HORIZONS_HOURS,
	type RiskComponents,
	type RiskHorizonHours,
} from "@hack-the-andes-project/db/schema/risk";
import type {
	IncidentCategory,
	IncidentSeverity,
	RoadStatus,
} from "@hack-the-andes-project/db/schema/scraper";
import type { Geometry, LineString, Position } from "geojson";

import {
	BASELINE_SUSCEPTIBILITY_MIN,
	MS_PER_HOUR,
	MS_PER_SECOND,
	ROUTE_REVIEW_ROUTING_HORIZON_HOURS,
	ROUTE_REVIEW_SEGMENT_LENGTH_M,
} from "../constants";
import type { LatLng } from "../hazards/types";
import { closedEdgeIds } from "../risk/compare-routes";
import {
	OFFICIAL_ALERT_CATEGORIES,
	OFFICIAL_ALERT_RADIUS_M,
} from "../risk/constants";
import { strongestOfficialAlert } from "../risk/exposure";
import { scoreCurrentRisk } from "../risk/score";
import { compareRouteCandidates } from "./ranking";
import {
	type RouteRecommendationDecision,
	recommendRoute,
	routeRiskLevelForScore,
} from "./recommend";
import type {
	RouteCandidateSource,
	RouteRiskHorizon,
	RouteRiskLevel,
	RouteSignalKind,
} from "./risk";

const HORIZON_BY_HOURS: Record<RiskHorizonHours, RouteRiskHorizon> = {
	24: "24h",
	48: "48h",
	72: "72h",
};
const REVIEW_HORIZONS: RouteRiskHorizon[] = [
	"now",
	...RISK_HORIZONS_HOURS.map((hours) => HORIZON_BY_HOURS[hours]),
];
const [, , LONGEST_HORIZON_HOURS] = RISK_HORIZONS_HOURS;

const SIGNAL_SOURCE_LABELS: Record<string, string> = {
	sutran_alerts: "SUTRAN",
	senamhi_warnings: "SENAMHI",
	indeci_coen_emergencies: "INDECI",
	bomberos_emergencies_24h: "Bomberos",
	igp_last_earthquake: "IGP",
	serfor_wildfire_alerts: "SERFOR",
	sratma_accidents: "MTC",
	rpp_latest_news: "RPP",
};
const FORECAST_SIGNAL_SOURCE = "Open-Meteo";
const BASELINE_SIGNAL_SOURCE = "INGEMMET";

export interface ReviewEdge extends LatLng {
	id: string;
	segmentId: string | null;
	roadCode: string | null;
	roadName: string | null;
	lengthM: number;
	travelTimeS: number;
	geometry: LineString;
}

export type IllapaRouteRole = "fastest" | "avoiding_closures" | "safest";

export interface ReviewRoute {
	role: IllapaRouteRole;
	edges: ReviewEdge[];
}

export interface ReviewAssessment {
	segmentId: string;
	horizonHours: RiskHorizonHours;
	score: number;
	forecastPrecipitationMm: number | null;
	components: RiskComponents;
	weatherFetchedAt: Date | null;
	assessedAt: Date;
}

export interface ReviewIncident {
	id: string;
	source: string;
	category: IncidentCategory;
	severity: IncidentSeverity;
	title: string;
	description: string | null;
	roadStatus: RoadStatus | null;
	roadCode: string | null;
	lat: number | null;
	lng: number | null;
	geometry: Geometry | null;
	observedAt: Date;
	validFrom: Date | null;
	validUntil: Date | null;
}

export interface ReviewRiskAssessment {
	horizon: RouteRiskHorizon;
	level: RouteRiskLevel;
	score: number;
}

export interface ReviewSegment {
	id: string;
	startM: number;
	endM: number;
	geometry: LineString;
	risk: ReviewRiskAssessment[];
}

export interface ReviewSignal {
	id: string;
	kind: RouteSignalKind;
	title: string;
	detail: string | null;
	source: string;
	sourceUrl: string | null;
	observedAt: Date;
	validFrom: Date | null;
	validUntil: Date | null;
	roadStatus: RoadStatus | null;
	incidentId: string | null;
	incidentCategory: IncidentCategory | null;
	geometry: Geometry | null;
	segmentIds: string[];
}

export interface ReviewCandidate {
	id: string;
	source: RouteCandidateSource;
	name: string;
	roadCodes: string[];
	geometry: LineString;
	distanceM: number;
	durationS: number;
	eligibility: {
		eligible: boolean;
		maxAxleCount: number | null;
		restriction: string | null;
	};
	risk: ReviewRiskAssessment[];
	recommendation: RouteRecommendationDecision;
	segments: ReviewSegment[];
	signals: ReviewSignal[];
	explanation: string | null;
}

export interface ReviewCandidateDraft
	extends Omit<ReviewCandidate, "recommendation"> {
	windowHours: RiskHorizonHours;
}

export interface AssembleRouteReviewInput {
	routes: ReviewRoute[];
	extraCandidates?: ReviewCandidateDraft[];
	assessments: ReviewAssessment[];
	incidents: ReviewIncident[];
	departureAt: Date;
	now: Date;
}

export interface AssembledRouteReview {
	horizons: RouteRiskHorizon[];
	recommendedCandidateId: string | null;
	candidates: ReviewCandidate[];
}

function concatenateLines(lines: LineString[]): LineString {
	const coordinates: Position[] = [];
	for (const line of lines) {
		// Consecutive edges share their junction vertex.
		coordinates.push(...line.coordinates.slice(coordinates.length > 0 ? 1 : 0));
	}
	return { type: "LineString", coordinates };
}

function maxOf(values: number[]): number | null {
	return values.length > 0 ? Math.max(...values) : null;
}

function riskAssessments(
	scoreFor: (horizon: RouteRiskHorizon) => number | null,
): ReviewRiskAssessment[] {
	return REVIEW_HORIZONS.flatMap((horizon) => {
		const score = scoreFor(horizon);
		return score === null
			? []
			: [{ horizon, level: routeRiskLevelForScore(score), score }];
	});
}

// The trip window is the smallest stored horizon that still covers arrival.
export function tripWindowHours(
	departureAt: Date,
	durationS: number,
	now: Date,
): RiskHorizonHours {
	const hoursUntilArrival =
		(departureAt.getTime() + durationS * MS_PER_SECOND - now.getTime()) /
		MS_PER_HOUR;
	return (
		RISK_HORIZONS_HOURS.find((hours) => hours >= hoursUntilArrival) ??
		LONGEST_HORIZON_HOURS
	);
}

export function incidentSignal(
	incident: ReviewIncident,
	kind: RouteSignalKind,
	segmentIds: string[],
): ReviewSignal {
	const isConfirmed = kind === "confirmed";
	return {
		id: incident.id,
		kind,
		title: incident.title,
		detail: incident.description,
		source: SIGNAL_SOURCE_LABELS[incident.source] ?? incident.source,
		sourceUrl: null,
		observedAt: incident.observedAt,
		validFrom: incident.validFrom,
		validUntil: incident.validUntil,
		roadStatus: incident.roadStatus,
		incidentId: incident.id,
		incidentCategory: incident.category,
		// Confirmed disruptions use the incident icons on the map; forecast
		// areas are often whole provinces and are placed on their segments.
		geometry:
			isConfirmed && incident.lat !== null && incident.lng !== null
				? { type: "Point", coordinates: [incident.lng, incident.lat] }
				: null,
		segmentIds,
	};
}

function buildIllapaDraft(
	route: ReviewRoute,
	assessmentsBySegment: Map<string, ReviewAssessment[]>,
	incidents: ReviewIncident[],
	departureAt: Date,
	now: Date,
): ReviewCandidateDraft {
	const candidateId = `illapa:${route.role}`;
	const chunks: ReviewEdge[][] = [];
	let chunkLengthM = ROUTE_REVIEW_SEGMENT_LENGTH_M;
	for (const routeEdge of route.edges) {
		if (chunkLengthM >= ROUTE_REVIEW_SEGMENT_LENGTH_M) {
			chunks.push([]);
			chunkLengthM = 0;
		}
		chunks.at(-1)?.push(routeEdge);
		chunkLengthM += routeEdge.lengthM;
	}
	const segmentIdForChunk = (index: number) => `${candidateId}:${index}`;
	const chunkIndexByEdgeId = new Map(
		chunks.flatMap((chunk, index) =>
			chunk.map((chunkEdge) => [chunkEdge.id, index] as const),
		),
	);
	const segmentIdsForEdges = (edgeIds: Set<string>) =>
		[
			...new Set(
				[...edgeIds].flatMap((edgeId) => {
					const index = chunkIndexByEdgeId.get(edgeId);
					return index === undefined ? [] : [index];
				}),
			),
		]
			.toSorted((first, second) => first - second)
			.map(segmentIdForChunk);

	const assessmentsOf = (chunk: ReviewEdge[]) =>
		chunk.flatMap((chunkEdge) =>
			chunkEdge.segmentId
				? (assessmentsBySegment.get(chunkEdge.segmentId) ?? [])
				: [],
		);
	const chunkScore = (chunk: ReviewEdge[], horizon: RouteRiskHorizon) =>
		maxOf(
			assessmentsOf(chunk).flatMap((assessment) => {
				if (horizon === "now") {
					return assessment.horizonHours === ROUTE_REVIEW_ROUTING_HORIZON_HOURS
						? [scoreCurrentRisk(assessment.components)]
						: [];
				}
				return HORIZON_BY_HOURS[assessment.horizonHours] === horizon
					? [assessment.score]
					: [];
			}),
		);

	let startM = 0;
	const segments = chunks.map((chunk, index): ReviewSegment => {
		const lengthM = chunk.reduce((total, { lengthM }) => total + lengthM, 0);
		const segment = {
			id: segmentIdForChunk(index),
			startM,
			endM: startM + lengthM,
			geometry: concatenateLines(chunk.map(({ geometry }) => geometry)),
			risk: riskAssessments((horizon) => chunkScore(chunk, horizon)),
		};
		startM += lengthM;
		return segment;
	});

	const durationS = route.edges.reduce(
		(total, { travelTimeS }) => total + travelTimeS,
		0,
	);
	const windowHours = tripWindowHours(departureAt, durationS, now);
	const windowHorizon = HORIZON_BY_HOURS[windowHours];

	const signals: ReviewSignal[] = [];
	for (const incident of incidents) {
		const isConfirmed =
			incident.roadStatus === "interrumpido" ||
			incident.roadStatus === "restringido";
		if (isConfirmed && incident.lat !== null && incident.lng !== null) {
			const matchedEdgeIds = closedEdgeIds(route.edges, [
				{ ...incident, lat: incident.lat, lng: incident.lng },
			]);
			if (matchedEdgeIds.size > 0) {
				signals.push(
					incidentSignal(
						incident,
						"confirmed",
						segmentIdsForEdges(matchedEdgeIds),
					),
				);
			}
		} else if (
			OFFICIAL_ALERT_CATEGORIES.some(
				(category) => category === incident.category,
			)
		) {
			const touchedEdgeIds = new Set(
				route.edges
					.filter(
						(routeEdge) =>
							strongestOfficialAlert(
								routeEdge,
								[incident],
								OFFICIAL_ALERT_RADIUS_M,
							) !== null,
					)
					.map(({ id }) => id),
			);
			if (touchedEdgeIds.size > 0) {
				signals.push(
					incidentSignal(
						incident,
						"forecast",
						segmentIdsForEdges(touchedEdgeIds),
					),
				);
			}
		}
	}

	const forecastChunks = chunks.flatMap((chunk, index) => {
		const level = segments[index]?.risk.find(
			({ horizon }) => horizon === windowHorizon,
		)?.level;
		return level === "high" || level === "critical" ? [{ chunk, index }] : [];
	});
	if (forecastChunks.length > 0) {
		const windowAssessments = forecastChunks
			.flatMap(({ chunk }) => assessmentsOf(chunk))
			.filter(({ horizonHours }) => horizonHours === windowHours);
		const forecastMm = maxOf(
			windowAssessments.flatMap(({ forecastPrecipitationMm }) =>
				forecastPrecipitationMm === null ? [] : [forecastPrecipitationMm],
			),
		);
		const fetchedAtTimes = windowAssessments.flatMap(({ weatherFetchedAt }) =>
			weatherFetchedAt ? [weatherFetchedAt.getTime()] : [],
		);
		signals.push({
			id: `${candidateId}:forecast`,
			kind: "forecast",
			title: `Lluvia pronosticada con riesgo alto en ${forecastChunks.length} ${forecastChunks.length === 1 ? "tramo" : "tramos"}`,
			detail:
				forecastMm === null
					? null
					: `Hasta ${Math.round(forecastMm)} mm en 24 h.`,
			source: FORECAST_SIGNAL_SOURCE,
			sourceUrl: null,
			observedAt: new Date(maxOf(fetchedAtTimes) ?? now.getTime()),
			validFrom: now,
			validUntil: new Date(now.getTime() + windowHours * MS_PER_HOUR),
			roadStatus: null,
			incidentId: null,
			incidentCategory: null,
			geometry: null,
			segmentIds: forecastChunks.map(({ index }) => segmentIdForChunk(index)),
		});
	}

	const baselineChunks = chunks.flatMap((chunk, index) =>
		assessmentsOf(chunk).some(
			({ components }) =>
				components.staticSusceptibility >= BASELINE_SUSCEPTIBILITY_MIN,
		)
			? [index]
			: [],
	);
	if (baselineChunks.length > 0) {
		const assessedAtTimes = baselineChunks.flatMap((index) =>
			assessmentsOf(chunks[index] ?? []).map(({ assessedAt }) =>
				assessedAt.getTime(),
			),
		);
		signals.push({
			id: `${candidateId}:baseline`,
			kind: "baseline",
			title: `Susceptibilidad alta a huaicos y derrumbes en ${baselineChunks.length} ${baselineChunks.length === 1 ? "tramo" : "tramos"}`,
			detail:
				"Exposición de base por movimientos en masa, pendiente y cercanía a ríos.",
			source: BASELINE_SIGNAL_SOURCE,
			sourceUrl: null,
			observedAt: new Date(maxOf(assessedAtTimes) ?? now.getTime()),
			validFrom: null,
			validUntil: null,
			roadStatus: null,
			incidentId: null,
			incidentCategory: null,
			geometry: null,
			segmentIds: baselineChunks.map(segmentIdForChunk),
		});
	}

	const lengthByRoad = new Map<string, number>();
	const lengthByCode = new Map<string, number>();
	for (const routeEdge of route.edges) {
		const roadLabel = routeEdge.roadName ?? routeEdge.roadCode;
		if (roadLabel) {
			lengthByRoad.set(
				roadLabel,
				(lengthByRoad.get(roadLabel) ?? 0) + routeEdge.lengthM,
			);
		}
		if (routeEdge.roadCode) {
			lengthByCode.set(
				routeEdge.roadCode,
				(lengthByCode.get(routeEdge.roadCode) ?? 0) + routeEdge.lengthM,
			);
		}
	}
	const byLength = (lengths: Map<string, number>) =>
		[...lengths]
			.toSorted(([, first], [, second]) => second - first)
			.map(([label]) => label);

	return {
		id: candidateId,
		source: "illapa",
		name: byLength(lengthByRoad).slice(0, 2).join(" – ") || candidateId,
		roadCodes: byLength(lengthByCode),
		geometry: concatenateLines(route.edges.map(({ geometry }) => geometry)),
		distanceM: route.edges.reduce((total, { lengthM }) => total + lengthM, 0),
		durationS,
		eligibility: { eligible: true, maxAxleCount: null, restriction: null },
		risk: riskAssessments((horizon) =>
			maxOf(
				segments.flatMap(
					(segment) =>
						segment.risk.find((assessment) => assessment.horizon === horizon)
							?.score ?? [],
				),
			),
		),
		segments,
		signals,
		explanation: null,
		windowHours,
	};
}

export function assembleRouteReview({
	routes,
	extraCandidates = [],
	assessments,
	incidents,
	departureAt,
	now,
}: AssembleRouteReviewInput): AssembledRouteReview {
	const assessmentsBySegment = new Map<string, ReviewAssessment[]>();
	for (const assessment of assessments) {
		assessmentsBySegment.set(assessment.segmentId, [
			...(assessmentsBySegment.get(assessment.segmentId) ?? []),
			assessment,
		]);
	}

	const seenRoutes = new Set<string>();
	const drafts = [
		...routes.flatMap((route) => {
			const routeKey = route.edges.map(({ id }) => id).join(",");
			if (seenRoutes.has(routeKey)) return [];
			seenRoutes.add(routeKey);
			return [
				buildIllapaDraft(
					route,
					assessmentsBySegment,
					incidents,
					departureAt,
					now,
				),
			];
		}),
		...extraCandidates,
	];

	const windowScore = (draft: ReviewCandidateDraft) =>
		draft.risk.find(
			({ horizon }) => horizon === HORIZON_BY_HOURS[draft.windowHours],
		)?.score ?? 0;
	const isInterrupted = (draft: ReviewCandidateDraft) =>
		draft.signals.some(
			(signal) =>
				signal.kind === "confirmed" && signal.roadStatus === "interrumpido",
		);

	const candidates = drafts.map(
		({ windowHours, ...draft }): ReviewCandidate => {
			const score = windowScore({ ...draft, windowHours });
			return {
				...draft,
				recommendation: recommendRoute({
					signals: draft.signals,
					windowLevel: routeRiskLevelForScore(score),
					hasLowerRiskAlternative: drafts.some((other) => {
						const otherLevel = routeRiskLevelForScore(windowScore(other));
						return (
							other.id !== draft.id &&
							other.eligibility.eligible &&
							!isInterrupted(other) &&
							windowScore(other) < score &&
							otherLevel !== "high" &&
							otherLevel !== "critical"
						);
					}),
				}),
			};
		},
	);

	const [recommended] = candidates
		.filter(
			(candidate) =>
				candidate.eligibility.eligible &&
				candidate.recommendation.rule !== "confirmed_interruption",
		)
		.toSorted(compareRouteCandidates);

	return {
		horizons: REVIEW_HORIZONS,
		recommendedCandidateId: recommended?.id ?? null,
		candidates,
	};
}
