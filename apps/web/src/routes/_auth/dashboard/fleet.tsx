import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@hack-the-andes-project/ui/components/empty";
import { FleetConfirmationDialog } from "@hack-the-andes-project/ui/components/fleet-confirmation-dialog";
import { FleetMap } from "@hack-the-andes-project/ui/components/fleet-map";
import { FleetQueryFeedback } from "@hack-the-andes-project/ui/components/fleet-query-feedback";
import { FleetTripPlanner } from "@hack-the-andes-project/ui/components/fleet-trip-planner";
import { FleetTripsTable } from "@hack-the-andes-project/ui/components/fleet-trips-table";
import { FleetVehiclesTable } from "@hack-the-andes-project/ui/components/fleet-vehicles-table";
import type { FleetTrip } from "@hack-the-andes-project/ui/lib/fleet";
import {
	EMPTY_FLEET_TRIPS,
	EMPTY_FLEET_VEHICLES,
} from "@hack-the-andes-project/ui/lib/fleet-constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { invalidateFleetQueries, useFleetQueries } from "@/lib/fleet-queries";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard/fleet")({
	component: FleetPage,
});

interface TripFinishSelection {
	trip: FleetTrip;
	status: "completed" | "cancelled";
}

function FleetPage() {
	const fleetQueries = useFleetQueries();
	const queryClient = useQueryClient();
	const vehiclesQuery = useQuery(fleetQueries.vehicles);
	const tripsQuery = useQuery(fleetQueries.trips);
	const [isPlanning, setIsPlanning] = useState(false);
	const [finishingTrip, setFinishingTrip] = useState<TripFinishSelection>();
	const vehicles = vehiclesQuery.data ?? EMPTY_FLEET_VEHICLES;
	const trips = tripsQuery.data ?? EMPTY_FLEET_TRIPS;
	const activeTrips = trips.filter((trip) => trip.status === "active");
	const createDemoConnection = useMutation(
		orpc.connections.create.mutationOptions({
			onSuccess: () => toast.success("Flota demo conectada"),
			onError: (error) => toast.error(error.message),
			onSettled: () => invalidateFleetQueries(queryClient),
		}),
	);
	const createTrip = useMutation(
		orpc.trips.create.mutationOptions({
			onSuccess: () => toast.success("Viaje creado"),
			onSettled: () => invalidateFleetQueries(queryClient),
		}),
	);
	const planDemoRoute = useMutation(orpc.trips.planDemo.mutationOptions());
	const completeTrip = useMutation(
		orpc.trips.complete.mutationOptions({
			onSuccess: () => {
				setFinishingTrip(undefined);
				toast.success("Viaje completado");
			},
			onSettled: () => invalidateFleetQueries(queryClient),
		}),
	);
	const cancelTrip = useMutation(
		orpc.trips.cancel.mutationOptions({
			onSuccess: () => {
				setFinishingTrip(undefined);
				toast.success("Viaje cancelado");
			},
			onSettled: () => invalidateFleetQueries(queryClient),
		}),
	);
	const finishMutation =
		finishingTrip?.status === "completed" ? completeTrip : cancelTrip;

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-2">
					<h2 className="type-title">Tu flota, en ruta</h2>
					<p className="type-body text-muted-foreground">
						Posiciones, viajes y llegadas estimadas de tu organización.
					</p>
				</div>
				<Button
					disabled={
						isPlanning ||
						!vehicles.some(
							(vehicle) => vehicle.lastLat !== null && vehicle.lastLng !== null,
						)
					}
					onClick={() => setIsPlanning(true)}
				>
					Nuevo viaje
				</Button>
			</div>
			<FleetQueryFeedback
				isPending={vehiclesQuery.isPending}
				isError={vehiclesQuery.isError}
				onRetry={() => vehiclesQuery.refetch()}
			/>
			{vehiclesQuery.isSuccess && !vehicles.length && (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>Tu flota aún no tiene vehículos</EmptyTitle>
						<EmptyDescription>
							Conecta Geotab o Samsara en Configuración, o prueba la plataforma
							con una flota demo que recorre tus viajes. Si ya tienes una
							conexión, revisa su estado y espera la próxima sincronización.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent className="flex-row flex-wrap justify-center">
						<Button
							disabled={createDemoConnection.isPending}
							onClick={() =>
								createDemoConnection.mutate({
									label: "Flota demo",
									credentials: { provider: "demo" },
								})
							}
						>
							{createDemoConnection.isPending
								? "Conectando…"
								: "Usar flota demo"}
						</Button>
						<Button
							render={<Link to="/dashboard/settings" />}
							variant="outline"
						>
							Ir a conexiones GPS
						</Button>
					</EmptyContent>
				</Empty>
			)}
			{Boolean(vehicles.length) && (
				<>
					{isPlanning ? (
						<FleetTripPlanner
							vehicles={vehicles}
							isPending={createTrip.isPending}
							isPlanningDemoRoute={planDemoRoute.isPending}
							onCreate={createTrip.mutateAsync}
							onPlanDemoRoute={planDemoRoute.mutateAsync}
							onClose={() => setIsPlanning(false)}
						/>
					) : (
						<FleetMap vehicles={vehicles} trips={activeTrips} />
					)}
					{vehicles.some(
						(vehicle) => vehicle.lastLat === null || vehicle.lastLng === null,
					) && (
						<p className="type-body text-muted-foreground">
							Los vehículos sin posición aparecerán en el mapa y podrán iniciar
							viajes cuando el proveedor envíe su ubicación.
						</p>
					)}
					<section className="min-w-0" aria-label="Vehículos">
						<FleetVehiclesTable vehicles={vehicles} />
					</section>
				</>
			)}
			<section className="flex min-w-0 flex-col gap-3" aria-label="Viajes">
				<h2 className="type-heading">Viajes</h2>
				<FleetQueryFeedback
					isPending={tripsQuery.isPending}
					isError={tripsQuery.isError}
					onRetry={() => tripsQuery.refetch()}
				/>
				{Boolean(trips.length) && (
					<FleetTripsTable
						trips={trips}
						onFinish={(trip, status) => {
							completeTrip.reset();
							cancelTrip.reset();
							setFinishingTrip({ trip, status });
						}}
					/>
				)}
				{tripsQuery.isSuccess && !trips.length && (
					<Empty className="border">
						<EmptyHeader>
							<EmptyTitle>Aún no hay viajes</EmptyTitle>
							<EmptyDescription>
								Crea un viaje para calcular su ruta y recibir alertas sobre los
								riesgos por delante.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</section>
			<FleetConfirmationDialog
				open={Boolean(finishingTrip)}
				title={
					finishingTrip?.status === "completed"
						? "Completar viaje"
						: "Cancelar viaje"
				}
				description={`Se cerrará «${finishingTrip?.trip.name ?? ""}» y dejará de evaluarse en busca de nuevos riesgos.`}
				actionLabel={
					finishingTrip?.status === "completed"
						? "Completar viaje"
						: "Cancelar viaje"
				}
				isPending={finishMutation.isPending}
				error={finishMutation.error}
				onClose={() => setFinishingTrip(undefined)}
				onConfirm={() => {
					if (finishingTrip)
						finishMutation.mutate({ id: finishingTrip.trip.id });
				}}
			/>
		</div>
	);
}
