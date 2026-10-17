import {
	Attachment,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@hack-the-andes-project/ui/components/attachment";
import { Badge } from "@hack-the-andes-project/ui/components/badge";
import {
	Bubble,
	BubbleContent,
} from "@hack-the-andes-project/ui/components/bubble";
import { Button } from "@hack-the-andes-project/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hack-the-andes-project/ui/components/card";
import { Checkbox } from "@hack-the-andes-project/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hack-the-andes-project/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@hack-the-andes-project/ui/components/empty";
import { Input } from "@hack-the-andes-project/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@hack-the-andes-project/ui/components/input-group";
import { Label } from "@hack-the-andes-project/ui/components/label";
import {
	Marker,
	MarkerContent,
} from "@hack-the-andes-project/ui/components/marker";
import {
	Message,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from "@hack-the-andes-project/ui/components/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@hack-the-andes-project/ui/components/message-scroller";
import { Separator } from "@hack-the-andes-project/ui/components/separator";
import {
	Field,
	FieldGroup,
} from "@hack-the-andes-project/ui/components/showcase/field";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	BellIcon,
	FileTextIcon,
	MapPinIcon,
	SearchIcon,
	Spinner,
} from "@hack-the-andes-project/ui/components/showcase/icons";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";
import {
	previewState,
	StateMatrix,
} from "@hack-the-andes-project/ui/components/showcase/state-matrix";
import { Skeleton } from "@hack-the-andes-project/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@hack-the-andes-project/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@hack-the-andes-project/ui/components/tabs";
import { Textarea } from "@hack-the-andes-project/ui/components/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@hack-the-andes-project/ui/components/tooltip";
import type { ComponentProps } from "react";
import { toast } from "sonner";

const BUTTON_VARIANTS: NonNullable<ComponentProps<typeof Button>["variant"]>[] =
	["default", "secondary", "outline", "ghost", "destructive", "link"];
const BUTTON_SIZES: NonNullable<ComponentProps<typeof Button>["size"]>[] = [
	"xs",
	"sm",
	"default",
	"lg",
];
const ICON_SIZES: NonNullable<ComponentProps<typeof Button>["size"]>[] = [
	"icon-xs",
	"icon-sm",
	"icon",
	"icon-lg",
];
interface BadgeExample {
	variant: NonNullable<ComponentProps<typeof Badge>["variant"]>;
	label: string;
}
const BADGE_EXAMPLES: BadgeExample[] = [
	{ variant: "default", label: "Ruta seleccionada" },
	{ variant: "secondary", label: "En evaluación" },
	{ variant: "outline", label: "PE-22" },
	{ variant: "ghost", label: "Detalle" },
	{ variant: "destructive", label: "Error de registro" },
	{ variant: "link", label: "Ver fuente" },
	{ variant: "low", label: "Bajo" },
	{ variant: "moderate", label: "Moderado" },
	{ variant: "high", label: "Alto" },
	{ variant: "critical", label: "Crítico" },
	{ variant: "info", label: "Información" },
	{ variant: "success", label: "Guardado" },
];

export function ComponentsSection() {
	return (
		<ShowcaseSection
			id="componentes"
			number="04"
			title="Piezas de la operación"
			description="Controles previsibles, estados visibles y mensajes concretos. Prueba los campos, las pestañas, los menús y las notificaciones; todo funciona de forma local."
		>
			<div className="flex min-w-0 flex-col gap-12">
				<div className="flex min-w-0 flex-col gap-6">
					<div>
						<h3 className="type-heading">Button · Decidir y actuar</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							Una acción principal por grupo. Secundario y outline para
							alternativas; ghost y link para consulta; destructive para
							eliminar.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<Button>
							Evaluar ruta <ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button variant="outline">Ver fuentes</Button>
					</div>
					<StateMatrix
						rows={BUTTON_VARIANTS}
						render={(variant, state) => (
							<Button variant={variant} {...previewState(state)}>
								{variant === "destructive" ? "Eliminar aviso" : "Evaluar ruta"}
							</Button>
						)}
					/>
					<div className="grid gap-8 lg:grid-cols-2">
						<div className="flex flex-col gap-4">
							<p className="type-label text-muted-foreground">Tamaños</p>
							<div className="flex flex-wrap items-end gap-4">
								{BUTTON_SIZES.map((size) => (
									<div key={size} className="flex flex-col items-start gap-2">
										<code className="text-muted-foreground text-xs">
											{size}
										</code>
										<Button size={size}>Continuar</Button>
									</div>
								))}
							</div>
						</div>
						<div className="flex flex-col gap-4">
							<p className="type-label text-muted-foreground">
								Solo icono · Con nombre accesible
							</p>
							<div className="flex flex-wrap items-end gap-4">
								{ICON_SIZES.map((size) => (
									<div key={size} className="flex flex-col items-start gap-2">
										<code className="text-muted-foreground text-xs">
											{size}
										</code>
										<Button
											size={size}
											variant="outline"
											aria-label="Buscar ruta"
										>
											<SearchIcon />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-4">
						<Button disabled aria-busy="true">
							<Spinner data-icon="inline-start" />
							Evaluando ruta…
						</Button>
						<Button variant="outline">
							<BellIcon data-icon="inline-start" />
							Monitorear
						</Button>
						<Button variant="secondary" className="max-w-full">
							<span className="truncate">
								Monitorear Panamericana Norte · Chiclayo–Piura
							</span>
						</Button>
					</div>
				</div>
				<Separator />
				<div className="flex min-w-0 flex-col gap-6">
					<div>
						<h3 className="type-heading">Campos · Contexto antes de enviar</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							Etiqueta persistente, ayuda concreta y errores vinculados al
							campo.
						</p>
					</div>
					<FieldGroup className="grid gap-6 md:grid-cols-2">
						<Field>
							<Label htmlFor="route-search">Buscar ruta</Label>
							<InputGroup>
								<InputGroupAddon>
									<SearchIcon />
								</InputGroupAddon>
								<InputGroupInput
									id="route-search"
									placeholder="Carretera Central"
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupText>PE</InputGroupText>
								</InputGroupAddon>
							</InputGroup>
							<p className="text-muted-foreground text-xs">
								Busca por carretera, ciudad o código.
							</p>
						</Field>
						<Field data-invalid>
							<Label htmlFor="invalid-location">
								Kilómetro del incidente *
							</Label>
							<Input
								id="invalid-location"
								defaultValue="La Oroya"
								aria-invalid="true"
								aria-describedby="location-error"
								required
							/>
							<p id="location-error" className="text-destructive text-xs">
								Ingresa el kilómetro, por ejemplo: 112.
							</p>
						</Field>
						<Field>
							<Label htmlFor="route-notes">Observación del operador</Label>
							<Textarea
								id="route-notes"
								defaultValue="Lluvias intensas en el acceso a La Oroya. Confirmar el estado del tramo antes de despachar."
							/>
						</Field>
						<Field data-disabled>
							<Label htmlFor="disabled-source">Fuente de referencia</Label>
							<Input
								id="disabled-source"
								defaultValue="SUTRAN · cierre confirmado"
								disabled
							/>
							<p className="text-muted-foreground text-xs">
								Este dato proviene del aviso y no se puede editar.
							</p>
						</Field>
					</FieldGroup>
					<StateMatrix
						rows={["Input", "Textarea", "Checkbox"]}
						states={["default", "hover", "focus", "disabled", "invalid"]}
						render={(control, state) => {
							const fieldId = `preview-${control}-${state}`;
							return (
								<Field
									data-invalid={state === "invalid" || undefined}
									data-disabled={state === "disabled" || undefined}
									className="min-w-40"
								>
									<Label htmlFor={fieldId}>
										{control === "Checkbox" ? "Recibir avisos" : "Ruta"}
									</Label>
									{control === "Input" ? (
										<Input
											id={fieldId}
											defaultValue="PE-22"
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									) : control === "Textarea" ? (
										<Textarea
											id={fieldId}
											defaultValue="Verificar el tramo."
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									) : (
										<Checkbox
											id={fieldId}
											defaultChecked
											aria-invalid={state === "invalid" || undefined}
											{...previewState(state)}
										/>
									)}
								</Field>
							);
						}}
					/>
				</div>
				<Separator />
				<div className="flex flex-col gap-6">
					<h3 className="type-heading">Badge · Estado con nombre</h3>
					<div className="flex flex-wrap gap-3">
						{BADGE_EXAMPLES.map((badge) => (
							<div key={badge.variant} className="flex flex-col gap-2">
								<code className="text-muted-foreground text-xs">
									{badge.variant}
								</code>
								<Badge variant={badge.variant}>{badge.label}</Badge>
							</div>
						))}
					</div>
					<div className="max-w-full">
						<Badge variant="outline" className="max-w-full">
							<span className="truncate">
								Interoceánica · Puerto Maldonado · tramo en evaluación
							</span>
						</Badge>
						<p className="mt-2 text-muted-foreground text-xs">
							Las etiquetas largas se truncan; el detalle conserva el nombre
							completo.
						</p>
					</div>
				</div>
				<div className="grid min-w-0 gap-6 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Carretera Central</CardTitle>
							<CardDescription>
								Km 112 · La Oroya · ejemplo de tarjeta
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							<Badge variant="critical">Crítico</Badge>
							<p>
								Cierre SUTRAN por huaico. Revisa una alternativa antes de
								despachar.
							</p>
						</CardContent>
						<CardFooter className="flex-wrap gap-2">
							<Button
								onClick={() =>
									toast.info("Ejemplo: evaluación de desvío abierta.")
								}
							>
								Evaluar desvío
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.info("Ejemplo: fuente SUTRAN del cierre confirmado.")
								}
							>
								Ver fuente
							</Button>
						</CardFooter>
					</Card>
					<div className="flex min-w-0 flex-col gap-4 border p-5">
						<h3 className="type-heading">Tabs · Cambiar el horizonte</h3>
						<Tabs defaultValue="now">
							<TabsList aria-label="Horizonte del aviso">
								<TabsTrigger value="now">Ahora</TabsTrigger>
								<TabsTrigger value="forecast">6–48 h</TabsTrigger>
								<TabsTrigger value="history" disabled>
									Historial
								</TabsTrigger>
							</TabsList>
							<TabsContent value="now">
								<Table>
									<TableCaption>
										Incidentes confirmados · datos de ejemplo.
									</TableCaption>
									<TableHeader>
										<TableRow>
											<TableHead>Ruta</TableHead>
											<TableHead>Estado</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell>Carretera Central km 112</TableCell>
											<TableCell>
												<Badge variant="critical">Crítico</Badge>
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Panamericana Sur</TableCell>
											<TableCell>
												<Badge variant="low">Bajo</Badge>
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TabsContent>
							<TabsContent value="forecast">
								<p className="py-4">
									Aviso SENAMHI naranja: lluvias intensas previstas en
									Chiclayo–Piura. Horizonte de 6 a 48 horas; confirmar antes de
									salir.
								</p>
							</TabsContent>
						</Tabs>
					</div>
				</div>
				<Separator />
				<div className="grid gap-8 md:grid-cols-2">
					<div className="flex flex-col gap-5">
						<h3 className="type-heading">Tooltip y menú contextual</h3>
						<div className="flex flex-wrap gap-3">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger render={<Button variant="outline" />}>
										¿Qué significa 6–48 h?
									</TooltipTrigger>
									<TooltipContent>
										Ventana estimada de una predicción; no confirma un cierre.
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<DropdownMenu>
								<DropdownMenuTrigger render={<Button variant="outline" />}>
									Acciones de ruta <ArrowDownIcon data-icon="inline-end" />
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuGroup>
										<DropdownMenuLabel>Carretera Central</DropdownMenuLabel>
										<DropdownMenuItem
											onClick={() =>
												toast.success("Monitoreo activado en este ejemplo.")
											}
										>
											Monitorear ruta
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												toast.info("Recomendación de ejemplo: desviar.")
											}
										>
											Ver recomendación
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onClick={() => toast.info("Aviso de ejemplo archivado.")}
										>
											Archivar aviso
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="flex flex-col gap-5">
						<h3 className="type-heading">Notificaciones · Sonner</h3>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								onClick={() =>
									toast.success("Ruta guardada", {
										description:
											"Carretera Central añadida a tu monitoreo de ejemplo.",
									})
								}
							>
								Éxito
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.info("Aviso actualizado", {
										description:
											"Interoceánica · Puerto Maldonado. Próxima revisión en 6 h.",
									})
								}
							>
								Información
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.warning("Aviso SENAMHI naranja", {
										description:
											"Lluvias intensas previstas en Chiclayo–Piura.",
									})
								}
							>
								Advertencia
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									toast.error("No se pudo guardar el aviso", {
										description: "Ejemplo de error. Intenta nuevamente.",
									})
								}
							>
								Error
							</Button>
						</div>
					</div>
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					<div
						className="flex flex-col gap-5 border p-6"
						role="status"
						aria-label="Cargando el resumen de ruta"
					>
						<h3 className="type-heading">Skeleton · Cargando datos</h3>
						<Skeleton className="h-5 w-2/3" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-24 w-full" />
						<p className="text-muted-foreground text-xs">
							Consultando el último estado de la ruta…
						</p>
					</div>
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MapPinIcon />
							</EmptyMedia>
							<EmptyTitle>Sin rutas en seguimiento</EmptyTitle>
							<EmptyDescription>
								Añade una ruta para reunir sus avisos y recomendaciones.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								onClick={() =>
									toast.success("Carretera Central añadida al ejemplo.")
								}
							>
								Añadir ruta
							</Button>
						</EmptyContent>
					</Empty>
				</div>
				<Separator />
				<div className="flex min-w-0 flex-col gap-6">
					<h3 className="type-heading">
						Conversación · De la alerta a la decisión
					</h3>
					<p className="type-body text-muted-foreground">
						Un hilo breve conserva la ruta, la fuente y la recomendación.
						Contenido de demostración.
					</p>
					<div className="h-96 min-w-0 border bg-card p-4">
						<MessageScrollerProvider>
							<MessageScroller>
								<MessageScrollerViewport>
									<MessageScrollerContent>
										<MessageScrollerItem messageId="context">
											<Marker variant="separator">
												<MarkerContent>Hoy · Carretera Central</MarkerContent>
											</Marker>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="operator" scrollAnchor>
											<Message align="end">
												<MessageContent>
													<MessageHeader>Operaciones</MessageHeader>
													<Bubble align="end">
														<BubbleContent>
															¿Podemos salir hacia La Oroya por la Carretera
															Central?
														</BubbleContent>
													</Bubble>
													<MessageFooter>08:12</MessageFooter>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="assistant">
											<Message>
												<MessageContent>
													<MessageHeader>
														Fénix · Asistente de rutas
													</MessageHeader>
													<Bubble variant="secondary">
														<BubbleContent>
															Riesgo crítico en el km 112: huaico y cierre
															confirmado por SUTRAN. Recomendación: desviar.
															Valida la alternativa con operaciones antes del
															despacho.
														</BubbleContent>
													</Bubble>
													<Attachment state="done">
														<AttachmentMedia variant="icon">
															<FileTextIcon />
														</AttachmentMedia>
														<AttachmentContent>
															<AttachmentTitle>
																aviso-cierre-carretera-central.pdf
															</AttachmentTitle>
															<AttachmentDescription>
																Referencia de ejemplo · SUTRAN
															</AttachmentDescription>
														</AttachmentContent>
													</Attachment>
													<MessageFooter>
														08:13 · Cierre confirmado
													</MessageFooter>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
										<MessageScrollerItem messageId="attachment-error">
											<Message>
												<MessageContent>
													<Attachment state="error">
														<AttachmentMedia variant="icon">
															<FileTextIcon />
														</AttachmentMedia>
														<AttachmentContent>
															<AttachmentTitle>
																reporte-de-campo-la-oroya.pdf
															</AttachmentTitle>
															<AttachmentDescription>
																No se pudo cargar el archivo.
															</AttachmentDescription>
														</AttachmentContent>
													</Attachment>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
									</MessageScrollerContent>
								</MessageScrollerViewport>
								<MessageScrollerButton aria-label="Ir al último mensaje">
									<ArrowDownIcon />
								</MessageScrollerButton>
							</MessageScroller>
						</MessageScrollerProvider>
					</div>
				</div>
			</div>
		</ShowcaseSection>
	);
}
