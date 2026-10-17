import type { Incident } from "@hack-the-andes-project/ui/lib/incident";
import {
	INCIDENT_SEVERITY_LABELS,
	INCIDENT_SEVERITY_TOKENS,
} from "@hack-the-andes-project/ui/lib/incident-constants";
import type { FeatureCollection, Geometry } from "geojson";
import type { ExpressionSpecification } from "maplibre-gl";
import { useMemo, useState } from "react";
import { useTokenColors } from "../hooks/use-token-colors";

import { Alert, AlertDescription, AlertTitle } from "./alert";
import {
	INCIDENT_FILL_LAYER_ID,
	INCIDENT_FILL_OPACITY_RATIO,
	INCIDENT_GEOMETRY_SOURCE_ID,
	INCIDENT_INTERACTIVE_LAYER_IDS,
	INCIDENT_LINE_LAYER_ID,
	INCIDENT_LINE_WIDTH_PX,
	INCIDENT_POINT_LAYER_ID,
	INCIDENT_POINT_RADIUS_PX,
	INCIDENT_POINT_STROKE_WIDTH_PX,
} from "./map-constants";
import { MapLegend } from "./map-legend";
import {
	Layer,
	type MapProps,
	MapView,
	Marker,
	NavigationControl,
	Source,
} from "./map-view";
import { SeverityDot } from "./severity";
import { Skeleton } from "./skeleton";

interface IncidentFeatureProperties {
	incidentId: string;
	severity: Incident["severity"];
}

export interface IncidentMapProps extends MapProps {
	incidents: Incident[];
	onIncidentSelect: (incidentId: string) => void;
}

export function IncidentMap({
	incidents,
	onIncidentSelect,
	children,
	onClick,
	onLoad,
	onError,
	interactiveLayerIds,
	...props
}: IncidentMapProps) {
	const tokenColors = useTokenColors([
		...Object.values(INCIDENT_SEVERITY_TOKENS),
		"--background",
	]);
	const criticalColor = tokenColors[INCIDENT_SEVERITY_TOKENS.critical];
	const warningColor = tokenColors[INCIDENT_SEVERITY_TOKENS.warning];
	const infoColor = tokenColors[INCIDENT_SEVERITY_TOKENS.info];
	const severityColor: ExpressionSpecification | null =
		criticalColor && warningColor && infoColor
			? [
					"match",
					["get", "severity"],
					"critical",
					criticalColor,
					"warning",
					warningColor,
					infoColor,
				]
			: null;
	const [isMapLoading, setIsMapLoading] = useState(true);
	const [hasMapError, setHasMapError] = useState(false);
	const incidentFeatures = useMemo<
		FeatureCollection<Geometry, IncidentFeatureProperties>
	>(
		() => ({
			type: "FeatureCollection",
			features: incidents.flatMap((incident) =>
				incident.geometry
					? [
							{
								type: "Feature",
								id: incident.id,
								geometry: incident.geometry,
								properties: {
									incidentId: incident.id,
									severity: incident.severity,
								},
							},
						]
					: [],
			),
		}),
		[incidents],
	);

	return (
		<section
			className="relative size-full overflow-hidden bg-muted"
			aria-label="Mapa de incidentes en Perú"
		>
			<MapView
				{...props}
				interactiveLayerIds={[
					...INCIDENT_INTERACTIVE_LAYER_IDS,
					...(interactiveLayerIds ?? []),
				]}
				onClick={(event) => {
					const incidentId = event.features?.find(
						(feature) => feature.properties?.incidentId,
					)?.properties.incidentId;
					if (typeof incidentId === "string") onIncidentSelect(incidentId);
					onClick?.(event);
				}}
				onLoad={(event) => {
					setIsMapLoading(false);
					setHasMapError(false);
					onLoad?.(event);
				}}
				onError={(event) => {
					setIsMapLoading(false);
					setHasMapError(true);
					onError?.(event);
				}}
			>
				<NavigationControl position="top-right" />
				{severityColor && tokenColors["--background"] && (
					<Source
						id={INCIDENT_GEOMETRY_SOURCE_ID}
						type="geojson"
						data={incidentFeatures}
					>
						<Layer
							id={INCIDENT_FILL_LAYER_ID}
							type="fill"
							filter={["==", ["geometry-type"], "Polygon"]}
							paint={{
								"fill-color": severityColor,
								"fill-opacity": INCIDENT_FILL_OPACITY_RATIO,
							}}
						/>
						<Layer
							id={INCIDENT_LINE_LAYER_ID}
							type="line"
							filter={[
								"match",
								["geometry-type"],
								["LineString", "Polygon"],
								true,
								false,
							]}
							paint={{
								"line-color": severityColor,
								"line-width": INCIDENT_LINE_WIDTH_PX,
							}}
						/>
						<Layer
							id={INCIDENT_POINT_LAYER_ID}
							type="circle"
							filter={["==", ["geometry-type"], "Point"]}
							paint={{
								"circle-color": severityColor,
								"circle-radius": INCIDENT_POINT_RADIUS_PX,
								"circle-stroke-color": tokenColors["--background"],
								"circle-stroke-width": INCIDENT_POINT_STROKE_WIDTH_PX,
							}}
						/>
					</Source>
				)}
				{incidents.map((incident) =>
					incident.lat !== null && incident.lng !== null ? (
						<Marker
							key={incident.id}
							latitude={incident.lat}
							longitude={incident.lng}
						>
							<button
								type="button"
								aria-label={`${incident.title} · ${INCIDENT_SEVERITY_LABELS[incident.severity]}`}
								title={incident.title}
								onClick={(event) => {
									event.stopPropagation();
									onIncidentSelect(incident.id);
								}}
								className="flex size-7 items-center justify-center rounded-full border border-border bg-background/95 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
							>
								<SeverityDot severity={incident.severity} className="size-3" />
							</button>
						</Marker>
					) : null,
				)}
				{children}
			</MapView>
			{isMapLoading && (
				<output
					className="pointer-events-none absolute inset-0 block p-4"
					aria-label="Cargando mapa"
				>
					<Skeleton className="size-full" />
				</output>
			)}
			{hasMapError && (
				<Alert className="absolute top-3 left-3 max-w-xs">
					<AlertTitle>Mapa parcialmente disponible</AlertTitle>
					<AlertDescription>
						No se pudieron cargar todos los recursos del mapa. Revisa tu
						conexión y vuelve a cargar la página.
					</AlertDescription>
				</Alert>
			)}
			<MapLegend className="pointer-events-none absolute bottom-20 left-3 max-w-[calc(100%-1.5rem)] sm:bottom-9" />
		</section>
	);
}
