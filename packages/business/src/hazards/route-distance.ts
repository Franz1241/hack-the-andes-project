import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { buffer } from "@turf/buffer";
import { lineIntersect } from "@turf/line-intersect";
import { nearestPointOnLine } from "@turf/nearest-point-on-line";
import type { Geometry, LineString, Position } from "geojson";

import type { HazardIncident } from "./types";

export function incidentGeometry(incident: HazardIncident): Geometry | null {
	if (incident.geometry) return incident.geometry;
	if (incident.lat !== null && incident.lng !== null) {
		return { type: "Point", coordinates: [incident.lng, incident.lat] };
	}
	return null;
}

function nearestAlongDistanceM(
	route: LineString,
	points: Position[],
	bufferM: number,
): number | null {
	let closest: number | null = null;
	for (const coordinates of points) {
		const snapped = nearestPointOnLine(route, coordinates, { units: "meters" });
		if (snapped.properties.pointDistance > bufferM) continue;
		const alongM = snapped.properties.totalDistance;
		if (closest === null || alongM < closest) closest = alongM;
	}
	return closest;
}

export function routeDistanceToHazardM(
	route: LineString,
	hazard: Geometry,
	bufferM: number,
): number | null {
	switch (hazard.type) {
		case "Point":
			return nearestAlongDistanceM(route, [hazard.coordinates], bufferM);
		case "MultiPoint":
			return nearestAlongDistanceM(route, hazard.coordinates, bufferM);
		case "GeometryCollection": {
			let closest: number | null = null;
			for (const member of hazard.geometries) {
				const alongM = routeDistanceToHazardM(route, member, bufferM);
				if (alongM !== null && (closest === null || alongM < closest)) {
					closest = alongM;
				}
			}
			return closest;
		}
		default: {
			// Buffering the hazard by the tolerance and then looking for where the
			// route enters that area handles both a route that crosses a polygon
			// edge and one that only passes nearby, with a single Turf operation.
			const zone = buffer(hazard, bufferM, { units: "meters" });
			if (!zone) return null;
			const routeStart = route.coordinates[0];
			if (routeStart && booleanPointInPolygon(routeStart, zone)) return 0;
			const crossings = lineIntersect(route, zone).features.map(
				(crossing) => crossing.geometry.coordinates,
			);
			return nearestAlongDistanceM(route, crossings, bufferM);
		}
	}
}
