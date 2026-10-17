import { ColorPair } from "@hack-the-andes-project/ui/components/showcase/color-pair";
import { ShowcaseSection } from "@hack-the-andes-project/ui/components/showcase/section";

const COLOR_PAIRS = [
	{ name: "Lienzo", background: "background", foreground: "foreground" },
	{ name: "Tarjeta", background: "card", foreground: "card-foreground" },
	{
		name: "Capa emergente",
		background: "popover",
		foreground: "popover-foreground",
	},
	{
		name: "Acción principal",
		background: "primary",
		foreground: "primary-foreground",
	},
	{
		name: "Acción secundaria",
		background: "secondary",
		foreground: "secondary-foreground",
	},
	{
		name: "Información de apoyo",
		background: "muted",
		foreground: "muted-foreground",
	},
	{ name: "Selección", background: "accent", foreground: "accent-foreground" },
	{
		name: "Destructivo sobre lienzo",
		background: "background",
		foreground: "destructive",
	},
	{
		name: "Riesgo bajo",
		background: "risk-low",
		foreground: "risk-low-foreground",
	},
	{
		name: "Riesgo moderado",
		background: "risk-moderate",
		foreground: "risk-moderate-foreground",
	},
	{
		name: "Riesgo alto",
		background: "risk-high",
		foreground: "risk-high-foreground",
	},
	{
		name: "Riesgo crítico",
		background: "risk-critical",
		foreground: "risk-critical-foreground",
	},
	{ name: "Información", background: "info", foreground: "info-foreground" },
	{ name: "Éxito", background: "success", foreground: "success-foreground" },
];

const PALETTE_GROUPS = [
	{
		name: "Superficies",
		description: "Capas sobrias para organizar la operación.",
		tokens: ["background", "card", "popover", "muted", "secondary", "accent"],
	},
	{
		name: "Tinta",
		description: "Jerarquía de lectura, sin ruido.",
		tokens: ["foreground", "muted-foreground", "primary", "primary-foreground"],
	},
	{
		name: "Marca",
		description: "Solo identidad, nunca en datos.",
		tokens: ["brand-ember", "brand-flame", "brand-gold"],
	},
	{
		name: "Riesgo",
		description:
			"Verde · Bajo / Amarillo · Moderado / Naranja · Alto / Rojo · Crítico.",
		tokens: ["risk-low", "risk-moderate", "risk-high", "risk-critical"],
	},
	{
		name: "Estado",
		description:
			"Información / Éxito. Un estado del sistema no es un nivel de riesgo.",
		tokens: ["info", "success", "destructive"],
	},
	{
		name: "Gráficos",
		description: "Series comparativas; el riesgo conserva su propia escala.",
		tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
	},
	{
		name: "Líneas",
		description: "Separación, controles y foco de teclado.",
		tokens: ["border", "input", "ring"],
	},
	{
		name: "Navegación",
		description: "La barra lateral comparte las superficies del sistema.",
		tokens: [
			"sidebar",
			"sidebar-foreground",
			"sidebar-primary",
			"sidebar-primary-foreground",
			"sidebar-accent",
			"sidebar-accent-foreground",
			"sidebar-border",
			"sidebar-ring",
		],
	},
];

const TOKEN_LABELS: Record<string, string> = {
	"risk-low": "Bajo · Verde",
	"risk-moderate": "Moderado · Amarillo",
	"risk-high": "Alto · Naranja",
	"risk-critical": "Crítico · Rojo",
	info: "Información",
	success: "Éxito",
	"brand-ember": "Brasa",
	"brand-flame": "Llama",
	"brand-gold": "Oro",
};

export function ColorSection() {
	return (
		<ShowcaseSection
			id="color"
			number="01"
			title="Color con propósito"
			description="Primero el significado, después el color. Cada superficie tiene su tinta y su contraste medido en el tema activo."
		>
			<div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{COLOR_PAIRS.map((pair) => (
					<ColorPair key={pair.name} {...pair} />
				))}
			</div>
			<p className="type-body mt-6 max-w-3xl text-muted-foreground">
				AA requiere 4.5:1 para texto normal. Las parejas que no llegan al umbral
				quedan señaladas: el color de riesgo se usa como relleno con su tinta,
				nunca como texto sobre el lienzo.
			</p>
			<div className="mt-12 flex flex-col gap-10">
				{PALETTE_GROUPS.map((group) => (
					<div key={group.name} className="grid gap-5 md:grid-cols-[14rem_1fr]">
						<div>
							<h3 className="type-heading">{group.name}</h3>
							<p className="mt-2 text-muted-foreground text-sm">
								{group.description}
							</p>
						</div>
						<div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
							{group.tokens.map((token) => (
								<div key={token} className="min-w-0">
									<div
										aria-hidden="true"
										className="h-16 border"
										style={{ backgroundColor: `var(--${token})` }}
									/>
									<p className="mt-2 break-words text-xs">
										{TOKEN_LABELS[token] ?? token}
									</p>
									<code className="break-words text-muted-foreground text-xs">
										--{token}
									</code>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</ShowcaseSection>
	);
}
