import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@hack-the-andes-project/ui/components/card";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import { cn } from "@hack-the-andes-project/ui/lib/utils";
import { SPACING_SCALE } from "@/constants";

export function SpacingSection() {
	return (
		<ShowcaseSection
			id="espacio"
			number="03"
			title="Orden sin adornos"
			description="Una base de 4 px, esquinas rectas y líneas finas. La interfaz deja espacio para leer la ruta."
		>
			<div className="grid gap-12 md:grid-cols-2">
				<div className="flex flex-col gap-3">
					<h3 className="type-heading mb-3">Escala de espacio</h3>
					{SPACING_SCALE.map((spacing) => (
						<div
							key={spacing.token}
							className="grid grid-cols-[2rem_5rem_1fr] items-center gap-4"
						>
							<code className="type-data">{spacing.token}</code>
							<span className="type-data text-muted-foreground">
								{spacing.size}
							</span>
							<div className={cn("h-4 bg-foreground", spacing.className)} />
						</div>
					))}
					<p className="type-body mt-4 text-muted-foreground">
						8 px dentro de un control; 16 px entre elementos; 32 px entre
						grupos; 64 px entre secciones.
					</p>
				</div>
				<div className="flex flex-col gap-6">
					<h3 className="type-heading">Radio: cero</h3>
					<div className="flex flex-wrap items-center gap-6">
						<div className="type-data grid size-24 place-items-center border bg-card">
							0 px
						</div>
						<div className="flex items-center gap-2">
							<span
								className="size-3 rounded-full bg-success"
								aria-hidden="true"
							/>
							<span className="text-sm">Estado · En línea</span>
						</div>
					</div>
					<p className="type-body text-muted-foreground">
						Todos los radios — sm, md, lg y xl — son 0. Botones, tarjetas,
						campos y capas conservan esquinas rectas. Solo los puntos de estado
						son redondos.
					</p>
				</div>
			</div>
			<div className="mt-12 grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Tarjeta</CardTitle>
						<CardDescription>Información persistente</CardDescription>
					</CardHeader>
					<CardContent>Superficie card · borde fino · sin sombra.</CardContent>
				</Card>
				<div className="flex flex-col gap-4 border bg-popover p-4 text-popover-foreground">
					<h3 className="type-heading">Capa emergente</h3>
					<p className="text-muted-foreground text-sm">
						Información contextual
					</p>
					<p className="text-sm">
						Superficie popover · borde fino · sin sombra.
					</p>
				</div>
				<div className="border bg-muted p-4">
					<div className="flex h-full flex-col gap-4 border bg-background p-4">
						<h3 className="type-heading">Diálogo</h3>
						<p className="text-muted-foreground text-sm">Decisión enfocada</p>
						<p className="text-sm">
							Superficie background · borde fino · sin sombra.
						</p>
					</div>
				</div>
			</div>
		</ShowcaseSection>
	);
}
