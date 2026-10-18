import { distance } from "@turf/distance";
import createGraph from "ngraph.graph";
import { aStar } from "ngraph.path";

import type { LatLng } from "../hazards/types";
import {
	HIGH_RISK_MIN_SCORE,
	MAX_ROAD_SPEED_MPS,
	MAX_SNAP_DISTANCE_M,
	RISK_SCORE_MAX,
	RISK_TIME_PENALTY_FACTOR,
} from "./constants";

export interface RoutingNode extends LatLng {
	id: number;
}

export interface RoutingEdge {
	id: string;
	fromNodeId: number;
	toNodeId: number;
	lengthM: number;
	travelTimeS: number;
	segmentId: string | null;
}

export interface RouteEvaluation {
	edgeIds: string[];
	distanceM: number;
	durationS: number;
	// Length-weighted mean of segment scores along the route.
	meanRiskScore: number;
	maxRiskScore: number;
	highRiskDistanceM: number;
	// Edges whose segment has no current assessment count as score 0 here and
	// are reported so consumers can judge coverage.
	unassessedDistanceM: number;
}

export interface FindRiskAwareRoutesInput {
	nodes: RoutingNode[];
	edges: RoutingEdge[];
	riskBySegment: Map<string, number>;
	blockedEdgeIds: Set<string>;
	origin: LatLng;
	destination: LatLng;
}

export interface RiskAwareRoutes {
	fastest: RouteEvaluation | null;
	safest: RouteEvaluation | null;
}

function distanceM(from: LatLng, to: LatLng): number {
	return distance([from.lng, from.lat], [to.lng, to.lat], { units: "meters" });
}

function nearestNode(nodes: RoutingNode[], point: LatLng): RoutingNode | null {
	let nearest: RoutingNode | null = null;
	let nearestDistanceM = MAX_SNAP_DISTANCE_M;
	for (const node of nodes) {
		const nodeDistanceM = distanceM(node, point);
		if (nodeDistanceM <= nearestDistanceM) {
			nearest = node;
			nearestDistanceM = nodeDistanceM;
		}
	}
	return nearest;
}

export function findRiskAwareRoutes({
	nodes,
	edges,
	riskBySegment,
	blockedEdgeIds,
	origin,
	destination,
}: FindRiskAwareRoutesInput): RiskAwareRoutes {
	const start = nearestNode(nodes, origin);
	const end = nearestNode(nodes, destination);
	if (!start || !end) {
		return { fastest: null, safest: null };
	}

	const graph = createGraph<RoutingNode, RoutingEdge>({ multigraph: true });
	for (const node of nodes) {
		graph.addNode(node.id, node);
	}
	// Closed edges are left out of the graph instead of using ngraph.path's
	// `blocked` option: that option still queues the blocked neighbour, and an
	// unreachable goal then comes back as a one-node "path".
	for (const edge of edges) {
		if (
			!blockedEdgeIds.has(edge.id) &&
			graph.hasNode(edge.fromNodeId) &&
			graph.hasNode(edge.toNodeId)
		) {
			graph.addLink(edge.fromNodeId, edge.toNodeId, edge);
		}
	}

	const riskScore = (edge: RoutingEdge) =>
		edge.segmentId === null ? undefined : riskBySegment.get(edge.segmentId);
	const fastestCost = (edge: RoutingEdge) => edge.travelTimeS;
	const safestCost = (edge: RoutingEdge) =>
		edge.travelTimeS *
		(1 + (RISK_TIME_PENALTY_FACTOR * (riskScore(edge) ?? 0)) / RISK_SCORE_MAX);

	const route = (
		cost: (edge: RoutingEdge) => number,
	): RouteEvaluation | null => {
		const pathNodes = aStar<RoutingNode, RoutingEdge>(graph, {
			oriented: true,
			distance: (_from, _to, link) => cost(link.data),
			heuristic: (from, to) =>
				distanceM(from.data, to.data) / MAX_ROAD_SPEED_MPS,
		})
			.find(start.id, end.id)
			// ngraph.path returns the path from destination back to origin.
			.reverse();
		if (pathNodes[0]?.id !== start.id) {
			return null;
		}

		const routeEdges: RoutingEdge[] = [];
		for (let index = 1; index < pathNodes.length; index += 1) {
			const fromId = pathNodes[index - 1]?.id;
			const toId = pathNodes[index]?.id;
			let cheapest: RoutingEdge | null = null;
			graph.forEachLinkedNode(
				fromId ?? "",
				(_node, link) => {
					if (
						link.toId === toId &&
						(cheapest === null || cost(link.data) < cost(cheapest))
					) {
						cheapest = link.data;
					}
				},
				true,
			);
			if (cheapest) routeEdges.push(cheapest);
		}

		let distanceTotalM = 0;
		let weightedRisk = 0;
		let maxRiskScore = 0;
		let highRiskDistanceM = 0;
		let unassessedDistanceM = 0;
		for (const edge of routeEdges) {
			const score = riskScore(edge);
			distanceTotalM += edge.lengthM;
			if (score === undefined) {
				unassessedDistanceM += edge.lengthM;
				continue;
			}
			weightedRisk += score * edge.lengthM;
			maxRiskScore = Math.max(maxRiskScore, score);
			if (score >= HIGH_RISK_MIN_SCORE) highRiskDistanceM += edge.lengthM;
		}

		return {
			edgeIds: routeEdges.map((edge) => edge.id),
			distanceM: distanceTotalM,
			durationS: routeEdges.reduce(
				(total, edge) => total + edge.travelTimeS,
				0,
			),
			meanRiskScore: distanceTotalM > 0 ? weightedRisk / distanceTotalM : 0,
			maxRiskScore,
			highRiskDistanceM,
			unassessedDistanceM,
		};
	};

	return { fastest: route(fastestCost), safest: route(safestCost) };
}
