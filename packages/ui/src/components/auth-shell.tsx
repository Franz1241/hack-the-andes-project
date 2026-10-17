import type { ReactNode } from "react";

import { BellIcon, CloudLightningIcon, MapIcon, TruckIcon } from "./icons";

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
			<span className="flex size-9 items-center justify-center bg-lightning text-puna">
				<CloudLightningIcon className="size-5" />
			</span>
			<span className="font-heading text-2xl tracking-tight">illapa</span>
		</span>
	);
}

export interface AuthShellProps {
	children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
	return (
		<div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
			<aside className="relative hidden overflow-hidden bg-puna p-12 text-puna-foreground lg:flex lg:flex-col lg:justify-between">
				<CloudLightningIcon
					aria-hidden
					strokeWidth={0.75}
					className="pointer-events-none absolute -top-20 -right-20 size-80 text-lightning/15"
				/>
				<BrandMark />
				<div className="relative max-w-lg">
					<h1 className="text-balance font-heading text-5xl leading-[1.05] tracking-tight">
						Tu flota, un paso adelante del clima y la carretera.
					</h1>
					<ul className="mt-12 flex flex-col gap-7">
						{AUTH_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
							<li key={title} className="flex gap-4">
								<span className="flex size-9 shrink-0 items-center justify-center border border-puna-foreground/20 text-lightning">
									<Icon className="size-4" />
								</span>
								<div>
									<p className="font-medium">{title}</p>
									<p className="mt-1 text-pretty text-puna-foreground/70 text-sm">
										{description}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>
				<p className="relative text-puna-foreground/60 text-xs">
					Datos de SENAMHI, INDECI, SUTRAN, IGP, SERFOR y Bomberos del Perú.
				</p>
			</aside>
			<main className="flex flex-col px-6 py-8 sm:px-10">
				<div className="lg:hidden">
					<BrandMark />
				</div>
				<div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
					{children}
				</div>
			</main>
		</div>
	);
}
