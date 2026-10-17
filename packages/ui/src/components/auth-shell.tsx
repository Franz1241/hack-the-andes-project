import type { ReactNode } from "react";
import { BellIcon, CloudLightningIcon, MapIcon, TruckIcon } from "./icons";
import { RainStreaks, StarRiver } from "./mayu-art";

const AUTH_HIGHLIGHTS = [
	{
		icon: MapIcon,
		title: "Incidencias en vivo",
		description:
			"Lluvias, huaicos, incendios y bloqueos de fuentes oficiales, sobre el mapa del Perú.",
	},
	{
		icon: TruckIcon,
		title: "Tu flota y su llegada",
		description:
			"Conecta Geotab o Samsara y sigue cada camión con su hora estimada de llegada.",
	},
	{
		icon: BellIcon,
		title: "Alertas con ruta alternativa",
		description:
			"Te avisamos antes de que un camión llegue a un peligro y te proponemos otra ruta.",
	},
];

function BrandMark() {
	return (
		<span className="relative flex items-center gap-3">
			<span className="flex size-9 items-center justify-center text-brand-river">
				<CloudLightningIcon aria-hidden className="size-5" />
			</span>
			<span className="type-title">ILLAPA</span>
		</span>
	);
}

export interface AuthShellProps {
	children: ReactNode;
	headerActions?: ReactNode;
}

export function AuthShell({ children, headerActions }: AuthShellProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
			<aside className="dark relative hidden overflow-hidden border-border border-r bg-background p-12 text-foreground lg:flex lg:flex-col lg:justify-between lg:gap-12">
				<StarRiver className="opacity-50" />
				<RainStreaks className="text-foreground/10" />
				<BrandMark />
				<div className="relative max-w-lg">
					<h1 className="type-title text-balance">
						Tu flota, un paso adelante del clima y la carretera.
					</h1>
					<p className="type-lead mt-6 text-muted-foreground">
						Anticipa el riesgo. Protege tu ruta.
					</p>
					<ul className="mt-12 flex flex-col gap-7">
						{AUTH_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
							<li key={title} className="flex gap-4">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground">
									<Icon aria-hidden className="size-4" />
								</span>
								<div>
									<p className="font-medium font-sans text-sm">{title}</p>
									<p className="type-body mt-2 text-pretty text-muted-foreground">
										{description}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>
				<p className="type-body relative text-muted-foreground">
					Datos de SENAMHI, INDECI, SUTRAN, IGP, SERFOR y Bomberos del Perú.
				</p>
			</aside>
			<main className="flex min-w-0 flex-col bg-background px-6 py-8 text-foreground sm:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
					<div className="lg:hidden">
						<BrandMark />
					</div>
					{headerActions && (
						<div className="ml-auto flex items-center gap-2">
							{headerActions}
						</div>
					)}
				</div>
				<div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
					{children}
				</div>
			</main>
		</div>
	);
}
