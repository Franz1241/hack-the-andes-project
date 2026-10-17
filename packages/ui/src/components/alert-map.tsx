import type { Geometry } from "geojson";

import type { FleetAlert, FleetTrip } from "../lib/fleet";
import { formatFleetDistance, formatFleetDuration } from "../lib/fleet-format";
import { INCIDENT_SEVERITY_COLORS } from "../lib/incident-constants";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { FleetMap } from "./fleet-map";
import { FleetRouteLayer } from "./fleet-route-layer";
import {
	FLEET_ALTERNATIVE_ROUTE_COLOR,
	FLEET_HAZARD_FILL_LAYER_ID,
	FLEET_HAZARD_LINE_LAYER_ID,
	FLEET_HAZARD_POINT_LAYER_ID,
	FLEET_HAZARD_SOURCE_ID,
	FLEET_ROUTE_COLOR,
	INCIDENT_FILL_OPACITY_RATIO,
	INCIDENT_LINE_WIDTH_PX,
	INCIDENT_POINT_RADIUS_PX,
	INCIDENT_POINT_STROKE_COLOR,
	INCIDENT_POINT_STROKE_WIDTH_PX,
} from "./map-constants";
import { Layer, Source } from "./map-view";

export interface AlertMapProps {
	alert: FleetAlert;
	trip?: FleetTrip;
}

export function AlertMap({ alert, trip }: AlertMapProps) {
	const incident = alert.incident;
	const hazardGeometry: Geometry | null =
		incident?.geometry ??
		(incident && incident.lat !== null && incident.lng !== null
			? { type: "Point", coordinates: [incident.lng, incident.lat] }
			: null);
	const alternative = alert.alternativeRoute;
	const geometries: Geometry[] = [];
	if (trip) geometries.push(trip.routeGeometry);
	if (hazardGeometry) geometries.push(hazardGeometry);
	if (alternative) geometries.push(alternative.geometry);
	const distanceDeltaM =
		alternative && trip ? alternative.distanceM - trip.routeDistanceM : null;
	const durationDeltaS =
		alternative && trip ? alternative.durationS - trip.routeDurationS : null;
	const hazardColor = INCIDENT_SEVERITY_COLORS[alert.severity];

	return (
		<section
			aria-label={`Detalle de ${alert.title}`}
			className="flex min-w-0 flex-col gap-3"
		>
			<h2 className="font-heading font-medium text-lg">{alert.title}</h2>
			<FleetMap
				label="Ruta y riesgo seleccionado"
				focusKey={`${alert.id}-${trip?.id ?? "no-trip"}`}
				focusGeometry={{ type: "GeometryCollection", geometries }}
			>
				{trip && (
					<FleetRouteLayer
						id={`alert-${trip.id}`}
						geometry={trip.routeGeometry}
					/>
				)}
				{alternative && (
					<FleetRouteLayer
						id={`alternative-${alert.id}`}
						geometry={alternative.geometry}
						alternative
					/>
				)}
				{hazardGeometry && (
					<Source
						id={FLEET_HAZARD_SOURCE_ID}
						type="geojson"
						data={hazardGeometry}
					>
						<Layer
							id={FLEET_HAZARD_FILL_LAYER_ID}
							type="fill"
							filter={["==", ["geometry-type"], "Polygon"]}
							paint={{
								"fill-color": hazardColor,
								"fill-opacity": INCIDENT_FILL_OPACITY_RATIO,
							}}
						/>
						<Layer
							id={FLEET_HAZARD_LINE_LAYER_ID}
							type="line"
							filter={[
								"match",
								["geometry-type"],
								["LineString", "Polygon"],
								true,
								false,
							]}
							paint={{
								"line-color": hazardColor,
								"line-width": INCIDENT_LINE_WIDTH_PX,
							}}
						/>
						<Layer
							id={FLEET_HAZARD_POINT_LAYER_ID}
							type="circle"
							filter={["==", ["geometry-type"], "Point"]}
							paint={{
								"circle-color": hazardColor,
								"circle-radius": INCIDENT_POINT_RADIUS_PX,
								"circle-stroke-color": INCIDENT_POINT_STROKE_COLOR,
								"circle-stroke-width": INCIDENT_POINT_STROKE_WIDTH_PX,
							}}
						/>
					</Source>
				)}
			</FleetMap>
			<section
				className="flex flex-wrap gap-4 text-xs"
				aria-label="Leyenda del mapa"
			>
				<span className="flex items-center gap-2">
					<span
						className="w-6 border-t-2"
						style={{ borderColor: FLEET_ROUTE_COLOR }}
					/>
					Ruta del viaje
				</span>
				{alternative && (
					<span className="flex items-center gap-2">
						<span
							className="w-6 border-t-2 border-dashed"
							style={{ borderColor: FLEET_ALTERNATIVE_ROUTE_COLOR }}
						/>
						Ruta alternativa
					</span>
				)}
				<span className="flex items-center gap-2">
					<span
						className="size-2 rounded-full"
						style={{ backgroundColor: hazardColor }}
					/>
					Riesgo
				</span>
			</section>
			{!hazardGeometry && (
				<p className="text-muted-foreground text-sm">
					El incidente no tiene una ubicación disponible.
				</p>
			)}
			{!trip && (
				<p className="text-muted-foreground text-sm">
					La ruta original del viaje no está disponible.
				</p>
			)}
			{alternative ? (
				<Alert>
					<AlertTitle>Ruta alternativa disponible</AlertTitle>
					<AlertDescription>
						<p>
							{formatFleetDistance(alternative.distanceM)} ·{" "}
							{formatFleetDuration(alternative.durationS)}
						</p>
						{distanceDeltaM !== null && durationDeltaS !== null && (
							<p>
								Respecto a la ruta del viaje: {distanceDeltaM > 0 ? "+" : ""}
								{formatFleetDistance(distanceDeltaM)} ·{" "}
								{durationDeltaS > 0 ? "+" : ""}
								{formatFleetDuration(durationDeltaS)}.
							</p>
						)}
					</AlertDescription>
				</Alert>
			) : (
				<p className="text-muted-foreground text-sm">
					No hay una ruta alternativa disponible para esta alerta.
				</p>
			)}
		</section>
	);
}
