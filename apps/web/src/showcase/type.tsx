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
import { useEffect, useRef, useState } from "react";

const TYPE_SPECIMENS = [
	{ token: "type-display", use: "Portada · Stack Sans Notch", copy: "Fénix" },
	{
		token: "type-title",
		use: "Secciones · Stack Sans Notch",
		copy: "Anticipar el riesgo",
	},
	{
		token: "type-heading",
		use: "Paneles · Stack Sans Notch",
		copy: "Carretera Central",
	},
	{
		token: "type-body",
		use: "Lectura · IBM Plex Mono",
		copy: "Lluvias intensas en La Oroya.",
	},
	{
		token: "type-label",
		use: "Etiquetas · IBM Plex Mono",
		copy: "Aviso SENAMHI naranja",
	},
	{
		token: "type-data",
		use: "Datos · IBM Plex Mono",
		copy: "112 km / 06:00 / 24 h",
	},
];

export function TypeSection() {
	const specimensRef = useRef<HTMLDivElement>(null);
	const [specifications, setSpecifications] = useState<Record<string, string>>(
		{},
	);
	useEffect(() => {
		const measure = () => {
			const nextSpecifications: Record<string, string> = {};
			for (const specimen of specimensRef.current?.querySelectorAll<HTMLElement>(
				"[data-type-specimen]",
			) ?? []) {
				const computed = getComputedStyle(specimen);
				nextSpecifications[specimen.dataset.typeSpecimen ?? ""] =
					`${computed.fontSize} / ${computed.lineHeight} / ${computed.fontWeight} / ${computed.letterSpacing}`;
			}
			setSpecifications(nextSpecifications);
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);
	return (
		<ShowcaseSection
			id="tipografia"
			number="02"
			title="Una voz, dos familias"
			description="Stack Sans Notch para declarar. IBM Plex Mono para explicar, comparar y decidir. El tamaño responde al espacio disponible."
		>
			<div ref={specimensRef} className="min-w-0">
				<Table>
					<TableCaption>
						Especificación activa: tamaño / interlineado / peso / espaciado
						entre letras.
					</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead>Token</TableHead>
							<TableHead>Especificación</TableHead>
							<TableHead>Uso</TableHead>
							<TableHead>Muestra</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{TYPE_SPECIMENS.map((specimen) => (
							<TableRow key={specimen.token}>
								<TableCell>
									<code>{specimen.token}</code>
								</TableCell>
								<TableCell>
									{specifications[specimen.token] ?? "Midiendo…"}
								</TableCell>
								<TableCell>{specimen.use}</TableCell>
								<TableCell>
									<div className="max-w-md overflow-hidden">
										<p
											data-type-specimen={specimen.token}
											className={`${specimen.token} truncate`}
										>
											{specimen.copy}
										</p>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<p className="type-body mt-10 max-w-3xl">
				En la Carretera Central, una alerta debe ayudar a decidir antes de
				salir. Consulta el{" "}
				<a
					className="underline underline-offset-4 focus-visible:outline focus-visible:outline-ring"
					href="#riesgo"
				>
					nivel de riesgo y su horizonte
				</a>
				, confirma la causa y comparte la recomendación con tu equipo. El
				identificador{" "}
				<code className="border bg-muted px-1 text-foreground">PE-22</code>{" "}
				mantiene cada aviso vinculado a su ruta.
			</p>
		</ShowcaseSection>
	);
}
