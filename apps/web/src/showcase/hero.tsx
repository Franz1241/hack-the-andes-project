import { RidgelineMountain } from "@hack-the-andes-project/ui/components/contour-art";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { SHOWCASE_SECTIONS } from "@/constants";
import { m } from "@/paraglide/messages";

export function HeroSection() {
	return (
		<header className="dark relative isolate overflow-hidden border-b bg-background text-foreground">
			<RidgelineMountain
				tone="brand"
				className="pointer-events-none absolute inset-0 size-full opacity-60"
			/>
			<div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-5 py-16 sm:px-8 md:py-24">
				<div className="flex items-start justify-between gap-4">
					<p className="type-label max-w-xs">{m.ds_hero_kicker()}</p>
					<div className="flex items-center gap-3">
						<span className="type-label hidden sm:inline">
							{m.ds_appearance()}
						</span>
						<ModeToggle />
						<LanguageToggle />
					</div>
				</div>
				<div className="flex max-w-2xl flex-col gap-6">
					<h1 className="type-display">{m.ds_hero_title()}</h1>
					<p className="type-body max-w-lg">{m.ds_hero_description()}</p>
				</div>
				<nav
					aria-label={m.ds_sections_navigation()}
					className="flex flex-wrap gap-x-6 gap-y-4"
				>
					{SHOWCASE_SECTIONS.map((section) => (
						<a
							key={section.id}
							href={`#${section.id}`}
							className="type-label underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-ring"
						>
							{section.label()}
						</a>
					))}
				</nav>
			</div>
		</header>
	);
}
