import type { FleetTrip } from "../lib/fleet";
import { TRIP_STATUS_LABELS } from "../lib/fleet-constants";
import { formatFleetDistance } from "../lib/fleet-format";
import { Badge } from "./badge";
import { Button } from "./button";
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

export interface FleetTripsTableProps {
	trips: FleetTrip[];
	onFinish: (trip: FleetTrip, status: "completed" | "cancelled") => void;
}

export function FleetTripsTable({ trips, onFinish }: FleetTripsTableProps) {
	return (
		<Table>
			<TableCaption>Viajes de tu organización.</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Viaje / destino</TableHead>
					<TableHead>Vehículo</TableHead>
					<TableHead>Estado</TableHead>
					<TableHead>Llegada estimada</TableHead>
					<TableHead>Alertas abiertas</TableHead>
					<TableHead>Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{trips.map((trip) => (
					<TableRow key={trip.id}>
						<TableCell>
							<p className="font-medium">{trip.name}</p>
							<p className="text-muted-foreground text-xs">
								{trip.destinationName} ·{" "}
								{formatFleetDistance(trip.routeDistanceM)}
							</p>
						</TableCell>
						<TableCell>{trip.vehicleName ?? "Vehículo eliminado"}</TableCell>
						<TableCell>
							<Badge
								variant={trip.status === "active" ? "secondary" : "outline"}
							>
								{TRIP_STATUS_LABELS[trip.status]}
							</Badge>
						</TableCell>
						<TableCell>
							{trip.etaAt ? <DateTime value={trip.etaAt} /> : "Sin estimación"}
						</TableCell>
						<TableCell>
							<Badge variant={trip.openAlertCount ? "destructive" : "outline"}>
								{trip.openAlertCount}
							</Badge>
						</TableCell>
						<TableCell>
							{trip.status === "active" ? (
								<div className="flex gap-2">
									<Button
										variant="outline"
										aria-label={`Completar ${trip.name}`}
										onClick={() => onFinish(trip, "completed")}
									>
										Completar
									</Button>
									<Button
										variant="ghost"
										aria-label={`Cancelar ${trip.name}`}
										onClick={() => onFinish(trip, "cancelled")}
									>
										Cancelar
									</Button>
								</div>
							) : (
								"Sin acciones"
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
