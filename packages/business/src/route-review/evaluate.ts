import type { Database } from "@hack-the-andes-project/db";
import {
	roadSegment,
	segmentRiskAssessment,
} from "@hack-the-andes-project/db/schema/risk";
import { incident } from "@hack-the-andes-project/db/schema/scraper";
import { and, eq, gt, inArray, isNotNull, isNull, or } from "drizzle-orm";

import { ROUTE_REVIEW_ROUTING_HORIZON_HOURS } from "../constants";
import type { LatLng } from "../hazards/types";
import {
	blockClosedEdges,
	fetchEdgeGeometries,
	loadRoadGraph,
	routingBounds,
	withinBounds,
} from "../risk/compare-routes";
import { OFFICIAL_ALERT_CATEGORIES } from "../risk/constants";
import { findRiskAwareRoutes, type RouteEvaluation } from "../risk/route";
import {
	type AssembledRouteReview,
	assembleRouteReview,
	type IllapaRouteRole,
	type ReviewRoute,
} from "./assemble";

export interface EvaluateRouteReviewInput {
	db: Database;
	origin: LatLng;
	destination: LatLng;
	departureAt: Date;
	now: Date;
}

const CONFIRMED_ROAD_STATUSES = ["interrumpido", "restringido"] as const;

export async function evaluateRouteReview({
	db,
	origin,
	destination,
	departureAt,
	now,
}: EvaluateRouteReviewInput): Promise<AssembledRouteReview> {
	const bounds = routingBounds(origin, destination);
	const [{ edges, nodes }, assessments, incidentRows] = await Promise.all([
		loadRoadGraph(db, bounds),
		db
			.select({
				segmentId: segmentRiskAssessment.segmentId,
				horizonHours: segmentRiskAssessment.horizonHours,
				score: segmentRiskAssessment.score,
				forecastPrecipitationMm: segmentRiskAssessment.forecastPrecipitationMm,
				components: segmentRiskAssessment.components,
				weatherFetchedAt: segmentRiskAssessment.weatherFetchedAt,
				assessedAt: segmentRiskAssessment.assessedAt,
			})
			.from(segmentRiskAssessment)
			.innerJoin(
				roadSegment,
				eq(roadSegment.id, segmentRiskAssessment.segmentId),
			)
			.where(
				and(
					gt(segmentRiskAssessment.validUntil, now),
					withinBounds(roadSegment, bounds),
				),
			),
		db
			.select({
				id: incident.id,
				source: incident.source,
				category: incident.category,
				severity: incident.severity,
				title: incident.title,
				description: incident.description,
				roadStatus: incident.roadStatus,
				roadCode: incident.roadCode,
				lat: incident.lat,
				lng: incident.lng,
				geometry: incident.geometry,
				occurredAt: incident.occurredAt,
				sourceUpdatedAt: incident.sourceUpdatedAt,
				firstSeenAt: incident.firstSeenAt,
				validFrom: incident.validFrom,
				validUntil: incident.validUntil,
			})
			.from(incident)
			.where(
				and(
					eq(incident.active, true),
					or(
						and(
							inArray(incident.roadStatus, CONFIRMED_ROAD_STATUSES),
							withinBounds(incident, bounds),
						),
						// Weather warnings are often province polygons without a
						// point, so they cannot be filtered by the routing box.
						and(
							inArray(incident.category, OFFICIAL_ALERT_CATEGORIES),
							or(isNull(incident.validUntil), gt(incident.validUntil, now)),
							or(isNotNull(incident.geometry), isNotNull(incident.lat)),
						),
					),
				),
			),
	]);

	const incidents = incidentRows.map(
		({ occurredAt, sourceUpdatedAt, firstSeenAt, ...row }) => ({
			...row,
			observedAt: sourceUpdatedAt ?? occurredAt ?? firstSeenAt,
		}),
	);
	const closures = incidents.flatMap((closure) =>
		closure.roadStatus === "interrumpido" &&
		closure.lat !== null &&
		closure.lng !== null
			? [{ ...closure, lat: closure.lat, lng: closure.lng }]
			: [],
	);
	const blockedEdgeIds = await blockClosedEdges(db, edges, closures);

	const riskBySegment = new Map(
		assessments.flatMap((assessment) =>
			assessment.horizonHours === ROUTE_REVIEW_ROUTING_HORIZON_HOURS
				? [[assessment.segmentId, assessment.score] as const]
				: [],
		),
	);
	const routingInput = { nodes, edges, riskBySegment, origin, destination };
	// The direct route ignores closures so an interruption on it is shown and
	// reroutes instead of silently disappearing from the list.
	const direct = findRiskAwareRoutes({
		...routingInput,
		blockedEdgeIds: new Set(),
	});
	const avoiding =
		blockedEdgeIds.size > 0
			? findRiskAwareRoutes({ ...routingInput, blockedEdgeIds })
			: direct;
	const evaluations: [IllapaRouteRole, RouteEvaluation | null][] = [
		["fastest", direct.fastest],
		["avoiding_closures", avoiding.fastest],
		["safest", avoiding.safest],
	];

	const edgesById = new Map(edges.map((edge) => [edge.id, edge]));
	const geometries = await fetchEdgeGeometries(db, [
		...new Set(
			evaluations.flatMap(([, evaluation]) => evaluation?.edgeIds ?? []),
		),
	]);
	const routes = evaluations.flatMap(([role, evaluation]): ReviewRoute[] =>
		evaluation
			? [
					{
						role,
						edges: evaluation.edgeIds.flatMap((edgeId) => {
							const edge = edgesById.get(edgeId);
							const geometry = geometries.get(edgeId);
							return edge && geometry ? [{ ...edge, geometry }] : [];
						}),
					},
				]
			: [],
	);

	return assembleRouteReview({
		routes,
		assessments,
		incidents,
		departureAt,
		now,
	});
}
