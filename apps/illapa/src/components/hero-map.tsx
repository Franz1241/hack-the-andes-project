import { Badge } from "@hack-the-andes-project/ui/components/badge";
import {
	Map as MapCanvas,
	MapMarker,
	MapRoute,
	MarkerContent,
	MarkerTooltip,
} from "@hack-the-andes-project/ui/components/map";
import { useTokenColors } from "@hack-the-andes-project/ui/hooks/use-token-colors";
import { cn } from "@hack-the-andes-project/ui/lib/utils";

import {
	HERO_MAP_MAX_ZOOM,
	HERO_MAP_MIN_ZOOM,
	HERO_ROUTE_DASH_ARRAY,
	HERO_ROUTE_WIDTH_PX,
	PERU_BOUNDS,
	PERU_BOUNDS_PADDING_PX,
} from "@/constants";
import {
	HERO_HAZARD_STATES,
	HERO_HAZARDS,
	PANAMERICANA_NORTE_LIMA_PIURA,
} from "@/hero-data";

export default function HeroMap() {
	const tokenColors = useTokenColors(["--foreground"]);
	const routeColor = tokenColors["--foreground"];

	return (
		<MapCanvas
			className="h-full w-full"
			bounds={PERU_BOUNDS}
			fitBoundsOptions={{ padding: PERU_BOUNDS_PADDING_PX }}
			minZoom={HERO_MAP_MIN_ZOOM}
			maxZoom={HERO_MAP_MAX_ZOOM}
			scrollZoom={false}
			dragRotate={false}
			touchPitch={false}
			attributionControl={{ compact: true }}
			locale={{ "Map.Title": "Mapa de avisos en los corredores del Perú" }}
		>
			{routeColor && (
				<MapRoute
					coordinates={PANAMERICANA_NORTE_LIMA_PIURA}
					color={routeColor}
					width={HERO_ROUTE_WIDTH_PX}
					dashArray={HERO_ROUTE_DASH_ARRAY}
					interactive={false}
				/>
			)}
			{HERO_HAZARDS.map((hazard) => (
				<MapMarker
					key={hazard.name}
					longitude={hazard.longitude}
					latitude={hazard.latitude}
				>
					<MarkerContent className="relative grid size-5 place-items-center">
						{hazard.state === "active" && (
							<span
								aria-hidden="true"
								className="absolute inset-0 rounded-full bg-risk-critical/40 motion-safe:animate-ping"
							/>
						)}
						<span
							role="img"
							aria-label={`${HERO_HAZARD_STATES[hazard.state].label}: ${hazard.name}, ${hazard.place}`}
							className={cn(
								"relative size-3 rounded-full ring-2 ring-foreground",
								HERO_HAZARD_STATES[hazard.state].dotClassName,
							)}
						/>
					</MarkerContent>
					<MarkerTooltip>
						<div className="flex max-w-xs flex-col items-start gap-2">
							<Badge variant={HERO_HAZARD_STATES[hazard.state].variant}>
								{HERO_HAZARD_STATES[hazard.state].label}
							</Badge>
							<span className="type-body">{hazard.name}</span>
							<span className="type-body text-muted-foreground">
								{hazard.place}
							</span>
						</div>
					</MarkerTooltip>
				</MapMarker>
			))}
		</MapCanvas>
	);
}
