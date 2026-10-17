import type { Incident } from "@hack-the-andes-project/ui/lib/incident";
import { INCIDENT_CATEGORY_LABELS } from "@hack-the-andes-project/ui/lib/incident-constants";

import { DateTime } from "./date-time";
import { SeverityBadge } from "./severity";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "./sheet";

export interface IncidentDetailsProps {
	incident?: Incident;
	onClose: () => void;
}

export function IncidentDetails({ incident, onClose }: IncidentDetailsProps) {
	return (
		<Sheet
			open={Boolean(incident)}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<SheetContent className="overflow-y-auto">
				<SheetHeader className="gap-3 pr-12">
					{incident && <SeverityBadge severity={incident.severity} />}
					<SheetTitle>{incident?.title ?? "Detalle del incidente"}</SheetTitle>
					<SheetDescription>
						{incident
							? INCIDENT_CATEGORY_LABELS[incident.category]
							: "Información del incidente"}
					</SheetDescription>
				</SheetHeader>
				{incident && (
					<div className="flex flex-col gap-5 px-4 pb-6">
						<p className="whitespace-pre-line text-sm leading-relaxed">
							{incident.description ??
								"La fuente no proporcionó una descripción adicional."}
						</p>
						<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-xs">
							<dt className="text-muted-foreground">Código de vía</dt>
							<dd>{incident.roadCode ?? "No informado"}</dd>
							<dt className="text-muted-foreground">Carretera</dt>
							<dd>{incident.roadName ?? "No informada"}</dd>
							<dt className="text-muted-foreground">Kilómetro</dt>
							<dd>{incident.roadKm ?? "No informado"}</dd>
							<dt className="text-muted-foreground">Tránsito</dt>
							<dd className="capitalize">
								{incident.roadStatus ?? "No informado"}
							</dd>
							<dt className="text-muted-foreground">Región</dt>
							<dd>{incident.region ?? "No informada"}</dd>
							<dt className="text-muted-foreground">Provincia</dt>
							<dd>{incident.provincia ?? "No informada"}</dd>
							<dt className="text-muted-foreground">Distrito</dt>
							<dd>{incident.distrito ?? "No informado"}</dd>
							<dt className="text-muted-foreground">Fuente</dt>
							<dd className="break-words">{incident.source}</dd>
							<dt className="text-muted-foreground">Último cambio</dt>
							<dd>
								<DateTime value={incident.lastChangedAt} />
							</dd>
						</dl>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
