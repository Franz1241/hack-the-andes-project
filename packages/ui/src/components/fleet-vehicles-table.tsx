import type { FleetVehicle } from "../lib/fleet";
import { DateTime } from "./date-time";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

export interface FleetVehiclesTableProps {
	vehicles: FleetVehicle[];
}

export function FleetVehiclesTable({ vehicles }: FleetVehiclesTableProps) {
	return (
		<Table>
			<TableCaption>
				Posiciones del proveedor GPS · actualización cada dos minutos.
			</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Vehículo</TableHead>
					<TableHead>Placa</TableHead>
					<TableHead>Velocidad</TableHead>
					<TableHead>Última posición</TableHead>
					<TableHead>Viaje en curso</TableHead>
					<TableHead>Llegada estimada</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{vehicles.map((vehicle) => (
					<TableRow key={vehicle.id}>
						<TableCell className="type-label">{vehicle.name}</TableCell>
						<TableCell>{vehicle.plate ?? "Sin placa"}</TableCell>
						<TableCell>
							{vehicle.lastSpeedKmh === null
								? "Sin datos"
								: `${Math.round(vehicle.lastSpeedKmh)} km/h`}
						</TableCell>
						<TableCell>
							{vehicle.lastPositionAt ? (
								<DateTime value={vehicle.lastPositionAt} />
							) : (
								"Esperando GPS"
							)}
						</TableCell>
						<TableCell>{vehicle.activeTrip?.name ?? "Sin viaje"}</TableCell>
						<TableCell>
							{vehicle.activeTrip?.etaAt ? (
								<DateTime value={vehicle.activeTrip.etaAt} />
							) : (
								"Sin estimación"
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
