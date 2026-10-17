import { Badge } from "@hack-the-andes-project/ui/components/badge";
import { Button } from "@hack-the-andes-project/ui/components/button";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";

export function DoDontSection() {
	return (
		<ShowcaseSection
			id="criterios"
			number="06"
			title="Criterios que se ven"
			description="Tres reglas para mantener la lectura clara cuando una decisión no puede esperar."
		>
			<div className="flex flex-col gap-8">
				<div>
					<h3 className="type-heading mb-4">La marca nunca representa datos</h3>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label">Sí · Semántica de riesgo</p>
							<Badge variant="high">Alto · Lluvias intensas</Badge>
							<p className="text-muted-foreground text-sm">
								Relleno risk-high y su tinta asociada.
							</p>
						</div>
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label text-destructive">
								No · Marca como riesgo
							</p>
							<span className="dark bg-brand-flame px-2 py-1 text-background text-sm">
								Alto · Lluvias intensas
							</span>
							<p className="text-muted-foreground text-sm">
								brand-flame identifica a Fénix; no codifica una alerta.
							</p>
						</div>
					</div>
				</div>
				<div>
					<h3 className="type-heading mb-4">
						El riesgo siempre lleva una etiqueta
					</h3>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label">Sí · Color y texto</p>
							<Badge variant="critical">Crítico · Cierre confirmado</Badge>
							<p className="text-muted-foreground text-sm">
								Se entiende incluso sin distinguir el color.
							</p>
						</div>
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label text-destructive">No · Solo color</p>
							<span
								className="size-3 rounded-full bg-risk-critical"
								role="img"
								aria-label="Ejemplo incorrecto: indicador sin etiqueta visible"
							/>
							<p className="text-muted-foreground text-sm">
								Un punto solo no explica la gravedad ni la causa.
							</p>
						</div>
					</div>
				</div>
				<div>
					<h3 className="type-heading mb-4">Una acción principal por grupo</h3>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label">Sí · Prioridad clara</p>
							<div className="flex flex-wrap gap-2">
								<Button>Evaluar desvío</Button>
								<Button variant="outline">Ver fuente</Button>
							</div>
							<p className="text-muted-foreground text-sm">
								La decisión destaca; el contexto acompaña.
							</p>
						</div>
						<div className="flex flex-col items-start gap-5 border p-6">
							<p className="type-label text-destructive">
								No · Acciones que compiten
							</p>
							<div className="flex flex-wrap gap-2">
								<Button>Evaluar desvío</Button>
								<Button>Ver fuente</Button>
							</div>
							<p className="text-muted-foreground text-sm">
								Dos acciones principales dificultan elegir el siguiente paso.
							</p>
						</div>
					</div>
				</div>
			</div>
		</ShowcaseSection>
	);
}
