import {
	Map as MapCanvas,
	MapMarker,
	MapRoute,
	MarkerContent,
	MarkerTooltip,
} from "@hack-the-andes-project/ui/components/map";

import {
	HERO_MAP_MAX_ZOOM,
	HERO_MAP_MIN_ZOOM,
	PERU_BOUNDS,
	PERU_BOUNDS_PADDING_PX,
} from "@/constants";
import { HERO_HAZARDS, PANAMERICANA_NORTE_LIMA_PIURA } from "@/hero-data";

export default function HeroMap() {
	return (
		<MapCanvas
			theme="light"
			className="h-full w-full"
			bounds={PERU_BOUNDS}
			fitBoundsOptions={{ padding: PERU_BOUNDS_PADDING_PX }}
			minZoom={HERO_MAP_MIN_ZOOM}
			maxZoom={HERO_MAP_MAX_ZOOM}
			scrollZoom={false}
			dragRotate={false}
			touchPitch={false}
			attributionControl={{ compact: true }}
		>
			<MapRoute
				coordinates={PANAMERICANA_NORTE_LIMA_PIURA}
				color="var(--river)"
				width={2}
				dashArray={[2, 2]}
				interactive={false}
			/>
			{HERO_HAZARDS.map((hazard) => (
				<MapMarker
					key={hazard.name}
					longitude={hazard.longitude}
					latitude={hazard.latitude}
				>
					<MarkerContent className="relative grid size-5 place-items-center">
						{hazard.state === "active" && (
							<span className="absolute inset-0 rounded-full bg-ember/40 motion-safe:animate-ping" />
						)}
						<span
							className={
								hazard.state === "active"
									? "relative size-3 rounded-full bg-ember ring-2 ring-background"
									: hazard.state === "watch"
										? "relative size-3 rounded-full bg-lightning ring-2 ring-background"
										: "relative size-3 rounded-full bg-puna ring-2 ring-background"
							}
						/>
					</MarkerContent>
					<MarkerTooltip className="bg-puna text-puna-foreground">
						<span className="font-medium">{hazard.name}</span>
						<span className="block text-puna-foreground/70">
							{hazard.place}
						</span>
					</MarkerTooltip>
				</MapMarker>
			))}
		</MapCanvas>
	);
}
