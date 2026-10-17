import { GPS_PROVIDER_LABELS } from "@hack-the-andes-project/business/providers/index";

import type { FleetConnection } from "../lib/fleet";
import { Button } from "./button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./card";
import { DateTime } from "./date-time";
import { ConnectionStatusBadge } from "./fleet-connection-status";

export interface FleetConnectionsProps {
	connections: FleetConnection[];
	onRemove: (connection: FleetConnection) => void;
}

export function FleetConnections({
	connections,
	onRemove,
}: FleetConnectionsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{connections.map((connection) => (
				<Card key={connection.id}>
					<CardHeader>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<CardTitle className="break-all">{connection.label}</CardTitle>
							<ConnectionStatusBadge status={connection.status} />
						</div>
						<CardDescription>
							{GPS_PROVIDER_LABELS[connection.provider]}
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<p>{connection.vehicleCount} vehículos</p>
						<p className="text-muted-foreground text-xs">
							Última sincronización:{" "}
							{connection.lastSyncAt ? (
								<DateTime value={connection.lastSyncAt} />
							) : (
								"Pendiente de la primera sincronización"
							)}
						</p>
						{connection.lastError && (
							<p role="alert" className="break-words text-destructive text-sm">
								{connection.lastError}
							</p>
						)}
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							aria-label={`Eliminar conexión ${connection.label}`}
							onClick={() => onRemove(connection)}
						>
							Eliminar conexión
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
