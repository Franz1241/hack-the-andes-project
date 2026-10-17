import { useState } from "react";

import type { FleetTrip, FleetVehicle } from "../lib/fleet";
import { DateTime } from "./date-time";
import { FleetRouteLayer } from "./fleet-route-layer";
import { FleetVehicleMarker } from "./fleet-vehicle-marker";
import { Popup } from "./map-view";

export interface FleetOverlayProps {
	vehicles: FleetVehicle[];
	trips: FleetTrip[];
}

export function FleetOverlay({ vehicles, trips }: FleetOverlayProps) {
	const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
	const selectedVehicle = vehicles.find(
		(vehicle) => vehicle.id === selectedVehicleId,
	);
	return (
		<>
			{trips
				.filter((trip) => trip.status === "active")
				.map((trip) => (
					<FleetRouteLayer
						key={trip.id}
						id={trip.id}
						geometry={trip.routeGeometry}
					/>
				))}
			{vehicles.map((vehicle) => (
				<FleetVehicleMarker
					key={vehicle.id}
					vehicle={vehicle}
					selected={vehicle.id === selectedVehicleId}
					onSelect={setSelectedVehicleId}
				/>
			))}
			{selectedVehicle &&
				selectedVehicle.lastLat !== null &&
				selectedVehicle.lastLng !== null && (
					<Popup
						latitude={selectedVehicle.lastLat}
						longitude={selectedVehicle.lastLng}
						closeOnClick={false}
						onClose={() => setSelectedVehicleId(undefined)}
					>
						<div className="flex flex-col gap-1 bg-popover p-2.5 pr-7 text-popover-foreground text-xs shadow-md ring-1 ring-foreground/10">
							<strong>{selectedVehicle.name}</strong>
							<span>
								{selectedVehicle.plate ?? "Sin placa"} ·{" "}
								{selectedVehicle.lastSpeedKmh === null
									? "Sin velocidad"
									: `${Math.round(selectedVehicle.lastSpeedKmh)} km/h`}
							</span>
							<span>
								Última posición:{" "}
								{selectedVehicle.lastPositionAt ? (
									<DateTime value={selectedVehicle.lastPositionAt} />
								) : (
									"Pendiente"
								)}
							</span>
							{selectedVehicle.activeTrip && (
								<>
									<span>{selectedVehicle.activeTrip.name}</span>
									<span>
										Llegada:{" "}
										{selectedVehicle.activeTrip.etaAt ? (
											<DateTime value={selectedVehicle.activeTrip.etaAt} />
										) : (
											"Sin estimación"
										)}
									</span>
								</>
							)}
						</div>
					</Popup>
				)}
		</>
	);
}
