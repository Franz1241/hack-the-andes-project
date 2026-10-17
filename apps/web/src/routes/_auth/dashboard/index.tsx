import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@hack-the-andes-project/ui/components/alert";
import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@hack-the-andes-project/ui/components/empty";
import { Field, FieldLabel } from "@hack-the-andes-project/ui/components/field";
import { FleetOverlay } from "@hack-the-andes-project/ui/components/fleet-overlay";
import { IncidentDetails } from "@hack-the-andes-project/ui/components/incident-details";
import { IncidentFilters } from "@hack-the-andes-project/ui/components/incident-filters";
import { IncidentMap } from "@hack-the-andes-project/ui/components/incident-map";
import { IncidentSummary } from "@hack-the-andes-project/ui/components/incident-summary";
import { Skeleton } from "@hack-the-andes-project/ui/components/skeleton";
import { Switch } from "@hack-the-andes-project/ui/components/switch";
import {
	EMPTY_FLEET_TRIPS,
	EMPTY_FLEET_VEHICLES,
} from "@hack-the-andes-project/ui/lib/fleet-constants";
import type { Incident } from "@hack-the-andes-project/ui/lib/incident";
import { INCIDENT_SEVERITY_OPTIONS } from "@hack-the-andes-project/ui/lib/incident-constants";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	DEFAULT_INCIDENT_LIMIT_ROWS,
	DEFAULT_SINCE_PRESET,
	EMPTY_INCIDENTS,
	INCIDENT_REFETCH_INTERVAL_MS,
	INCIDENT_SINCE_PRESETS,
} from "@/constants";
import { useFleetQueries } from "@/lib/fleet-queries";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard/")({
	component: IncidentMapPage,
});

function IncidentMapPage() {
	const fleetQueries = useFleetQueries();
	const [showFleet, setShowFleet] = useState(false);
	const vehiclesQuery = useQuery(fleetQueries.vehicles);
	const tripsQuery = useQuery({ ...fleetQueries.trips, enabled: showFleet });
	const [categories, setCategories] = useState<Incident["category"][]>([]);
	const [severities, setSeverities] = useState(INCIDENT_SEVERITY_OPTIONS);
	const [sincePreset, setSincePreset] = useState(DEFAULT_SINCE_PRESET);
	const [selectedIncidentId, setSelectedIncidentId] = useState<string>();
	const sinceDurationMs =
		INCIDENT_SINCE_PRESETS.find((preset) => preset.value === sincePreset)
			?.durationMs ?? null;
	const since = useMemo(
		() =>
			sinceDurationMs === null
				? undefined
				: new Date(Date.now() - sinceDurationMs),
		[sinceDurationMs],
	);
	const input = {
		categories: categories.length ? categories : undefined,
		severities,
		since,
		limit: DEFAULT_INCIDENT_LIMIT_ROWS,
	};
	const incidentsQuery = useQuery({
		...orpc.incidents.list.queryOptions({ input }),
		queryFn: ({ signal }) =>
			client.incidents.list(
				{
					...input,
					since:
						sinceDurationMs === null
							? undefined
							: new Date(Date.now() - sinceDurationMs),
				},
				{ signal },
			),
		refetchInterval: INCIDENT_REFETCH_INTERVAL_MS,
	});
	const summaryQuery = useQuery({
		...orpc.incidents.summary.queryOptions(),
		refetchInterval: INCIDENT_REFETCH_INTERVAL_MS,
	});
	const incidents = incidentsQuery.data ?? EMPTY_INCIDENTS;
	const selectedIncident = incidents.find(
		(incident) => incident.id === selectedIncidentId,
	);
	const unlocatedCount = incidents.filter(
		(incident) =>
			(incident.lat === null || incident.lng === null) && !incident.geometry,
	).length;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<IncidentFilters
				categories={categories}
				severities={severities}
				sincePreset={sincePreset}
				sincePresets={INCIDENT_SINCE_PRESETS}
				onCategoriesChange={setCategories}
				onSeveritiesChange={setSeverities}
				onSincePresetChange={setSincePreset}
				onReset={() => {
					setCategories([]);
					setSeverities(INCIDENT_SEVERITY_OPTIONS);
					setSincePreset(DEFAULT_SINCE_PRESET);
				}}
			/>
			{Boolean(vehiclesQuery.data?.length) && (
				<Field orientation="horizontal" className="w-auto border-b px-4 py-2">
					<Switch
						id="show-fleet"
						checked={showFleet}
						onCheckedChange={setShowFleet}
					/>
					<FieldLabel htmlFor="show-fleet">Mostrar flota</FieldLabel>
					{showFleet && tripsQuery.isPending && (
						<span className="type-data text-muted-foreground">
							Cargando rutas…
						</span>
					)}
				</Field>
			)}
			{showFleet && (vehiclesQuery.isError || tripsQuery.isError) && (
				<Alert variant="destructive">
					<AlertTitle>No se pudo actualizar la flota</AlertTitle>
					<AlertDescription>
						Se muestran los últimos datos disponibles.
						<Button
							variant="link"
							onClick={() => {
								void vehiclesQuery.refetch();
								void tripsQuery.refetch();
							}}
						>
							Reintentar
						</Button>
					</AlertDescription>
				</Alert>
			)}
			<IncidentSummary
				counts={summaryQuery.data?.bySeverity}
				isPending={summaryQuery.isPending}
				isError={summaryQuery.isError}
			/>
			{incidentsQuery.isError && (
				<Alert variant="destructive">
					<AlertTitle>No se pudieron actualizar los incidentes</AlertTitle>
					<AlertDescription>
						{incidentsQuery.data
							? "Se muestran los últimos datos disponibles. "
							: "Verifica tu conexión. "}
						<Button variant="link" onClick={() => incidentsQuery.refetch()}>
							Reintentar
						</Button>
					</AlertDescription>
				</Alert>
			)}
			{incidents.length === DEFAULT_INCIDENT_LIMIT_ROWS && (
				<Alert>
					<AlertTitle>Se alcanzó el límite de resultados</AlertTitle>
					<AlertDescription>
						Se muestran los {DEFAULT_INCIDENT_LIMIT_ROWS} incidentes más
						recientes. Usa los filtros para acotar la búsqueda.
					</AlertDescription>
				</Alert>
			)}
			<div className="relative min-h-64 flex-1">
				<IncidentMap
					incidents={incidents}
					onIncidentSelect={setSelectedIncidentId}
				>
					{showFleet && (
						<FleetOverlay
							vehicles={vehiclesQuery.data ?? EMPTY_FLEET_VEHICLES}
							trips={tripsQuery.data ?? EMPTY_FLEET_TRIPS}
						/>
					)}
				</IncidentMap>
				{incidentsQuery.isPending && (
					<output
						className="pointer-events-none absolute top-3 left-3 flex w-56 flex-col gap-2 border border-border bg-popover p-3"
						aria-label="Cargando incidentes"
					>
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-2/3" />
					</output>
				)}
				{incidentsQuery.isSuccess && !incidents.length && (
					<div className="pointer-events-none absolute inset-x-3 top-3 flex justify-center">
						<Empty className="max-w-sm border border-border bg-popover p-4">
							<EmptyHeader>
								<EmptyTitle>Sin incidentes para estos filtros</EmptyTitle>
								<EmptyDescription>
									{severities.length
										? "Prueba otras categorías o amplía el período."
										: "Selecciona al menos una severidad para ver incidentes."}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</div>
				)}
			</div>
			<footer
				className="type-data flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-card px-4 py-2 text-muted-foreground"
				aria-live="polite"
			>
				<span>
					{incidentsQuery.isPending
						? "Cargando incidentes…"
						: `${incidents.length} incidentes encontrados`}
					{Boolean(unlocatedCount) && ` · ${unlocatedCount} sin ubicación`}
				</span>
				<span>
					{incidentsQuery.isFetching
						? "Actualizando…"
						: "Actualización automática cada minuto"}
				</span>
			</footer>
			<IncidentDetails
				incident={selectedIncident}
				onClose={() => setSelectedIncidentId(undefined)}
			/>
		</div>
	);
}
