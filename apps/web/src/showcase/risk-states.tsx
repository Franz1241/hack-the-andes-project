import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@hack-the-andes-project/ui/components/alert";
import { Badge } from "@hack-the-andes-project/ui/components/badge";
import { TriangleAlertIcon } from "@hack-the-andes-project/ui/components/showcase/icons";
import { RouteDiagram } from "@hack-the-andes-project/ui/components/showcase/route-diagram";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import { cn } from "@hack-the-andes-project/ui/lib/utils";
import { RISK_LEVELS } from "@/constants";

export function RiskStatesSection() {
	return (
		<ShowcaseSection
			id="riesgo"
			number="05"
			title="El riesgo siempre tiene nombre"
			description="Verde, amarillo, naranja y rojo: una escala alineada con los colores de aviso SENAMHI. El nivel, la causa y el horizonte se leen juntos."
		>
			<div className="grid grid-cols-2 lg:grid-cols-4">
				{RISK_LEVELS.map((risk) => (
					<div
						key={risk.variant}
						className={cn(
							"flex min-w-0 flex-col gap-4 p-5",
							risk.fillClassName,
							risk.inkClassName,
						)}
					>
						<p className="type-label">{risk.colorName}</p>
						<h3 className="type-heading">{risk.label}</h3>
						<p className="text-sm">
							Ejemplo: {risk.recommendation.toLowerCase()}
						</p>
					</div>
				))}
			</div>
			<p className="mt-4 text-muted-foreground text-xs">
				La recomendación depende del tramo y de la evidencia. El color por sí
				solo no determina una acción.
			</p>
			<div className="mt-10 grid gap-10 md:grid-cols-2">
				<div className="flex flex-col gap-5">
					<h3 className="type-heading">Etiquetas de riesgo</h3>
					<div className="flex flex-wrap gap-3">
						{RISK_LEVELS.map((risk) => (
							<Badge key={risk.variant} variant={risk.variant}>
								{risk.label}
							</Badge>
						))}
					</div>
				</div>
				<div className="flex flex-col gap-5">
					<h3 className="type-heading">Marcadores de mapa</h3>
					<div className="flex flex-wrap gap-5">
						{RISK_LEVELS.map((risk) => (
							<div key={risk.variant} className="flex items-center gap-2">
								<span
									aria-hidden="true"
									className={cn("size-3 shrink-0", risk.fillClassName)}
								/>
								<span className="text-sm">{risk.label}</span>
							</div>
						))}
					</div>
				</div>
			</div>
			<figure className="mt-10 border bg-card p-5">
				<figcaption className="type-label">
					Riesgo por tramo · esquema de ejemplo
				</figcaption>
				<RouteDiagram />
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{RISK_LEVELS.map((risk) => (
						<div key={risk.variant} className="flex flex-col items-start gap-2">
							<Badge variant={risk.variant}>{risk.label}</Badge>
							<span className="text-muted-foreground text-xs">
								{risk.colorName}
							</span>
						</div>
					))}
				</div>
			</figure>
			<div className="mt-8 grid gap-4 md:grid-cols-2">
				<Alert variant="critical">
					<TriangleAlertIcon />
					<AlertTitle>Crítico · Cierre confirmado</AlertTitle>
					<AlertDescription>
						Carretera Central km 112, La Oroya. Huaico y cierre SUTRAN. Ahora:
						desviar y validar la alternativa antes del despacho. Escenario de
						ejemplo.
					</AlertDescription>
				</Alert>
				<Alert variant="high">
					<TriangleAlertIcon />
					<AlertTitle>Alto · Predicción de 6–48 h</AlertTitle>
					<AlertDescription>
						Panamericana Norte, Chiclayo–Piura. Lluvias intensas y aviso SENAMHI
						naranja. Retrasar la salida y revisar la actualización. Escenario de
						ejemplo; no confirma un cierre.
					</AlertDescription>
				</Alert>
			</div>
		</ShowcaseSection>
	);
}
