import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@hack-the-andes-project/ui/components/alert";
import { Badge } from "@hack-the-andes-project/ui/components/badge";
import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hack-the-andes-project/ui/components/card";
import { TopoBackground } from "@hack-the-andes-project/ui/components/contour-art";
import {
	ArrowRightIcon,
	BellIcon,
} from "@hack-the-andes-project/ui/components/showcase/icons";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@hack-the-andes-project/ui/components/table";
import { useState } from "react";
import { toast } from "sonner";
import { ROUTE_EXAMPLES } from "@/constants";

export function ExampleScreenSection() {
	const [selectedRoute, setSelectedRoute] = useState(ROUTE_EXAMPLES[0]);
	return (
		<ShowcaseSection
			id="panel"
			number="07"
			title="Del sistema a la ruta"
			description="La misma gramática en una pantalla de trabajo: riesgo, horizonte, causa y una recomendación accionable."
		>
			<div className="relative isolate min-w-0 overflow-hidden border bg-background p-4 sm:p-6">
				<TopoBackground className="text-foreground/[0.06]" />
				<div className="relative flex min-w-0 flex-col gap-8">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex flex-col gap-3">
							<p className="type-label text-muted-foreground">
								Fénix / Operaciones
							</p>
							<h3 className="type-heading">Panel de rutas</h3>
							<p className="text-muted-foreground text-sm">
								Cinco rutas. Una vista para anticipar la próxima decisión.
							</p>
						</div>
						<Badge variant="outline">Datos de demostración</Badge>
					</div>
					<div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
						<div className="min-w-0 border bg-card p-2">
							<Table className="lg:table-fixed">
								<TableCaption>
									Selecciona una ruta para consultar el aviso. Escenarios
									ilustrativos, sin datos en vivo.
								</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead className="lg:w-1/3">Ruta</TableHead>
										<TableHead className="lg:w-24">Riesgo</TableHead>
										<TableHead className="lg:w-28">Horizonte</TableHead>
										<TableHead>Causa</TableHead>
										<TableHead className="lg:w-40">Recomendación</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{ROUTE_EXAMPLES.map((route) => (
										<TableRow
											key={route.id}
											data-state={
												selectedRoute.id === route.id ? "selected" : undefined
											}
										>
											<TableCell>
												<Button
													variant="link"
													className="lg:h-auto lg:min-h-8 lg:w-full lg:justify-start lg:whitespace-normal lg:px-0 lg:text-left"
													onClick={() => setSelectedRoute(route)}
													aria-pressed={selectedRoute.id === route.id}
												>
													{route.name}
												</Button>
												<p className="type-data px-2.5 text-muted-foreground lg:px-0">
													{route.id}
												</p>
											</TableCell>
											<TableCell>
												<Badge variant={route.risk}>{route.riskLabel}</Badge>
											</TableCell>
											<TableCell>
												<span className="type-data">{route.horizon}</span>
											</TableCell>
											<TableCell className="whitespace-normal">
												{route.cause}
											</TableCell>
											<TableCell>{route.recommendation}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						<Card>
							<CardHeader>
								<p className="type-label text-muted-foreground">
									Ruta seleccionada
								</p>
								<CardTitle>{selectedRoute.name}</CardTitle>
								<CardDescription>
									{selectedRoute.id} · Horizonte:{" "}
									{selectedRoute.horizon.toLowerCase()}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-5">
								<Badge variant={selectedRoute.risk}>
									{selectedRoute.riskLabel}
								</Badge>
								<Alert variant={selectedRoute.risk}>
									<AlertTitle>{selectedRoute.cause}</AlertTitle>
									<AlertDescription>
										Recomendación: {selectedRoute.recommendation.toLowerCase()}.
										Confirma el estado del tramo y coordina con operaciones
										antes de salir.
									</AlertDescription>
								</Alert>
								<p className="text-muted-foreground text-xs">
									La evidencia y el horizonte acompañan cada decisión. Revisa la
									vigencia del aviso antes del despacho.
								</p>
							</CardContent>
							<CardFooter className="flex-wrap gap-2">
								<Button
									onClick={() =>
										toast.info(
											`Recomendación de ejemplo: ${selectedRoute.recommendation.toLowerCase()}`,
											{ description: selectedRoute.name },
										)
									}
								>
									{selectedRoute.recommendation}
									<ArrowRightIcon data-icon="inline-end" />
								</Button>
								<Button
									variant="outline"
									onClick={() =>
										toast.success("Seguimiento activado en el ejemplo", {
											description: selectedRoute.name,
										})
									}
								>
									<BellIcon data-icon="inline-start" />
									Seguir ruta
								</Button>
							</CardFooter>
						</Card>
					</div>
				</div>
			</div>
		</ShowcaseSection>
	);
}
