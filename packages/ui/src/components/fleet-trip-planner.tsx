import { useState } from "react";

import { FLEET_COORDINATE_FRACTION_DIGITS } from "../constants";
import type {
	FleetDemoRoute,
	FleetDemoRouteInput,
	FleetDestination,
	FleetTripInput,
	FleetVehicle,
} from "../lib/fleet";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./field";
import { FleetMap } from "./fleet-map";
import { Input } from "./input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

export interface FleetTripPlannerProps {
	vehicles: FleetVehicle[];
	isPending: boolean;
	isPlanningDemoRoute: boolean;
	onCreate: (input: FleetTripInput) => Promise<unknown>;
	onPlanDemoRoute: (input: FleetDemoRouteInput) => Promise<FleetDemoRoute>;
	onClose: () => void;
}

export function FleetTripPlanner({
	vehicles,
	isPending,
	isPlanningDemoRoute,
	onCreate,
	onPlanDemoRoute,
	onClose,
}: FleetTripPlannerProps) {
	const [vehicleId, setVehicleId] = useState<string>();
	const [destination, setDestination] = useState<FleetDestination>();
	const [demoRoute, setDemoRoute] = useState<FleetDemoRoute>();
	const [tripName, setTripName] = useState("");
	const [destinationName, setDestinationName] = useState("");
	const [error, setError] = useState<string>();
	const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
	const locatedVehicles = vehicles.filter(
		(vehicle) => vehicle.lastLat !== null && vehicle.lastLng !== null,
	);
	async function planDemoRoute(scenario: FleetDemoRouteInput["scenario"]) {
		if (!selectedVehicle) return;
		setError(undefined);
		try {
			const plannedRoute = await onPlanDemoRoute({
				vehicleId: selectedVehicle.id,
				scenario,
			});
			setDemoRoute(plannedRoute);
			setDestination(plannedRoute.destination);
			setTripName(
				plannedRoute.incidentTitle
					? "Demo con incidente en ruta"
					: "Demo sin incidentes",
			);
			setDestinationName("Destino demo");
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "No se pudo preparar la ruta demo.",
			);
		}
	}
	return (
		<Card>
			<CardHeader>
				<CardTitle>Nuevo viaje</CardTitle>
				<CardDescription>
					Elige un vehículo, nombra el viaje y haz clic en el mapa para marcar
					el destino. También puedes mover el mapa con el teclado y usar su
					centro.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={async (event) => {
						event.preventDefault();
						if (!selectedVehicle || !destination) {
							setError("Selecciona un vehículo y marca el destino en el mapa.");
							return;
						}
						const formData = new FormData(event.currentTarget);
						setError(undefined);
						try {
							await onCreate({
								vehicleId: selectedVehicle.id,
								name: String(formData.get("name")),
								destination,
								destinationName:
									String(formData.get("destinationName")) || undefined,
							});
							onClose();
						} catch (cause) {
							setError(
								cause instanceof Error
									? cause.message
									: "No se pudo crear el viaje.",
							);
						}
					}}
				>
					<fieldset disabled={isPending} className="min-w-0">
						<FieldGroup className="sm:grid sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="trip-vehicle">Vehículo</FieldLabel>
								<Select
									value={vehicleId ?? null}
									onValueChange={(value) => {
										setVehicleId(value ?? undefined);
										setDestination(undefined);
										setDemoRoute(undefined);
									}}
									disabled={isPending}
									items={locatedVehicles.map((vehicle) => ({
										value: vehicle.id,
										label: vehicle.name,
									}))}
								>
									<SelectTrigger id="trip-vehicle" className="w-full">
										<SelectValue placeholder="Selecciona un vehículo" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{locatedVehicles.map((vehicle) => (
												<SelectItem key={vehicle.id} value={vehicle.id}>
													{vehicle.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								<FieldDescription>
									Solo se muestran vehículos con posición GPS.
								</FieldDescription>
							</Field>
							<Field>
								<FieldLabel htmlFor="trip-name">Nombre del viaje</FieldLabel>
								<Input
									id="trip-name"
									name="name"
									placeholder="Entrega a Arequipa"
									value={tripName}
									onChange={(event) => setTripName(event.target.value)}
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="trip-destination-name">
									Nombre del destino (opcional)
								</FieldLabel>
								<Input
									id="trip-destination-name"
									name="destinationName"
									placeholder="Almacén de destino"
									value={destinationName}
									onChange={(event) => setDestinationName(event.target.value)}
								/>
							</Field>
							{selectedVehicle?.provider === "demo" && (
								<Field>
									<FieldLabel id="trip-demo-route-label">Ruta demo</FieldLabel>
									<ButtonGroup aria-labelledby="trip-demo-route-label">
										<Button
											type="button"
											variant="outline"
											disabled={isPlanningDemoRoute}
											onClick={() => planDemoRoute("hazard")}
										>
											Pasa por un incidente
										</Button>
										<Button
											type="button"
											variant="outline"
											disabled={isPlanningDemoRoute}
											onClick={() => planDemoRoute("clear")}
										>
											Sin incidentes
										</Button>
									</ButtonGroup>
									<FieldDescription aria-live="polite">
										{isPlanningDemoRoute
											? "Buscando una ruta…"
											: demoRoute
												? demoRoute.incidentTitle
													? `La ruta pasa por «${demoRoute.incidentTitle}».`
													: "La ruta no pasa por ningún incidente activo."
												: "Marca un destino de prueba con o sin un incidente activo en el camino."}
									</FieldDescription>
								</Field>
							)}
						</FieldGroup>
					</fieldset>
					{selectedVehicle?.activeTrip && (
						<Alert>
							<AlertTitle>Se reemplazará el viaje en curso</AlertTitle>
							<AlertDescription>
								Al crear este viaje, se cancelará «
								{selectedVehicle.activeTrip.name}».
							</AlertDescription>
						</Alert>
					)}
					<FleetMap
						vehicles={selectedVehicle ? [selectedVehicle] : locatedVehicles}
						focusKey={
							demoRoute
								? `${selectedVehicle?.id}:${demoRoute.destination.lat},${demoRoute.destination.lng}`
								: (selectedVehicle?.id ?? "planner")
						}
						focusGeometry={
							demoRoute
								? {
										type: "Point",
										coordinates: [
											demoRoute.destination.lng,
											demoRoute.destination.lat,
										],
									}
								: null
						}
						destination={destination}
						onDestinationChange={
							selectedVehicle && !isPending
								? (nextDestination) => {
										setDestination(nextDestination);
										setDemoRoute(undefined);
									}
								: undefined
						}
						label="Seleccionar destino del viaje"
					/>
					<output
						className="type-data text-muted-foreground"
						aria-live="polite"
					>
						{destination
							? `Destino: ${destination.lat.toFixed(FLEET_COORDINATE_FRACTION_DIGITS)}, ${destination.lng.toFixed(FLEET_COORDINATE_FRACTION_DIGITS)}`
							: "Selecciona un vehículo y marca un punto en el mapa."}
					</output>
					{error && (
						<Alert variant="destructive">
							<AlertTitle>No se pudo crear el viaje</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					<div className="flex flex-wrap justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={onClose}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isPending || !selectedVehicle || !destination}
						>
							{isPending ? "Calculando ruta…" : "Crear viaje"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
