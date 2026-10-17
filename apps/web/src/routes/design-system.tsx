import { Separator } from "@hack-the-andes-project/ui/components/separator";
import { createFileRoute } from "@tanstack/react-router";
import { ColorSection } from "@/showcase/color";
import { ComponentsSection } from "@/showcase/components";
import { DoDontSection } from "@/showcase/do-dont";
import { ExampleScreenSection } from "@/showcase/example-screen";
import { HeroSection } from "@/showcase/hero";
import { RiskStatesSection } from "@/showcase/risk-states";
import { SpacingSection } from "@/showcase/spacing";
import { TypeSection } from "@/showcase/type";

export const Route = createFileRoute("/design-system")({
	component: DesignSystemPage,
	head: () => ({
		meta: [
			{ title: "Fénix · Sistema de diseño" },
			{
				name: "description",
				content:
					"El sistema visual de Fénix: claridad para anticipar el riesgo climático en las rutas del Perú.",
			},
		],
	}),
});

function DesignSystemPage() {
	return (
		<main
			id="design-system"
			lang="es-PE"
			className="min-w-0 bg-background text-foreground"
		>
			<HeroSection />
			<div className="mx-auto min-w-0 max-w-7xl px-5 sm:px-8">
				<ColorSection />
				<Separator />
				<TypeSection />
				<Separator />
				<SpacingSection />
				<Separator />
				<ComponentsSection />
				<Separator />
				<RiskStatesSection />
				<Separator />
				<DoDontSection />
				<Separator />
				<ExampleScreenSection />
				<Separator />
				<footer className="flex flex-wrap items-center justify-between gap-4 py-8">
					<p className="type-label text-muted-foreground">
						Equipo Fénix · Hack the Andes
					</p>
					<a
						className="type-label underline underline-offset-4 focus-visible:outline focus-visible:outline-ring"
						href="#design-system"
					>
						Volver al inicio
					</a>
				</footer>
			</div>
		</main>
	);
}
