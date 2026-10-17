import { HAZARD_BUFFER_M, LOOKAHEAD_M } from "../constants";
import { isAlertableIncident } from "./alertable";
import { projectOntoRoute } from "./progress";
import { incidentGeometry, routeDistanceToHazardM } from "./route-distance";
import { effectiveSpeedMps } from "./speed";
import type {
	HazardAhead,
	HazardIncident,
	RouteCandidate,
	VehicleState,
} from "./types";

export interface FindHazardsAheadInput {
	route: RouteCandidate;
	vehicle: VehicleState;
	incidents: HazardIncident[];
	lookaheadM?: number;
	bufferM?: number;
}

export function findHazardsAhead({
	route,
	vehicle,
	incidents,
	lookaheadM = LOOKAHEAD_M,
	bufferM = HAZARD_BUFFER_M,
}: FindHazardsAheadInput): HazardAhead[] {
	const progress = projectOntoRoute(route.geometry, vehicle.position);
	const speedMps = effectiveSpeedMps(route, vehicle);
	const hazards: HazardAhead[] = [];
	for (const incident of incidents) {
		if (!isAlertableIncident(incident)) continue;
		const geometry = incidentGeometry(incident);
		if (!geometry) continue;
		const alongM = routeDistanceToHazardM(route.geometry, geometry, bufferM);
		if (alongM === null) continue;
		const distanceAheadM = alongM - progress.distanceAlongM;
		if (distanceAheadM < 0 || distanceAheadM > lookaheadM) continue;
		hazards.push({
			incident,
			distanceAheadM,
			etaSeconds: speedMps > 0 ? distanceAheadM / speedMps : null,
			severity: incident.severity,
		});
	}
	return hazards.sort(
		(left, right) => left.distanceAheadM - right.distanceAheadM,
	);
}
