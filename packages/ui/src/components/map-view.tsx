import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { ComponentProps } from "react";
import MapLibre from "react-map-gl/maplibre";
import { cn } from "../lib/utils";

import {
	MAP_SPANISH_LOCALE,
	OPENFREEMAP_STYLE_URL,
	PERU_INITIAL_VIEW_STATE,
} from "./map-constants";

import "maplibre-gl/dist/maplibre-gl.css";

// MapLibre 6 cannot locate its worker after bundling; Vite must emit the worker URL.
setWorkerUrl(workerUrl);

export type {
	LayerProps,
	MapLayerMouseEvent,
	MapRef,
} from "react-map-gl/maplibre";
export {
	Layer,
	Marker,
	NavigationControl,
	Popup,
	Source,
	useMap,
} from "react-map-gl/maplibre";

export interface MapProps extends ComponentProps<typeof MapLibre> {}

export function MapView({
	initialViewState = PERU_INITIAL_VIEW_STATE,
	mapStyle = OPENFREEMAP_STYLE_URL,
	locale = MAP_SPANISH_LOCALE,
	children,
	...props
}: MapProps) {
	return (
		<div
			className={cn(
				"contents",
				"[&_.maplibregl-ctrl-group]:border! [&_.maplibregl-ctrl-group]:rounded-none! [&_.maplibregl-ctrl-group]:border-border! [&_.maplibregl-ctrl-group]:bg-popover! [&_.maplibregl-ctrl-group]:shadow-none!",
				"[&_.maplibregl-ctrl-group>button]:rounded-none! [&_.maplibregl-ctrl-group>button]:border-border!",
				"[&_.maplibregl-ctrl-group>button:focus-visible]:outline-none! [&_.maplibregl-ctrl-group>button:focus-visible]:ring-1! [&_.maplibregl-ctrl-group>button:focus-visible]:ring-inset! [&_.maplibregl-ctrl-group>button:focus-visible]:ring-ring! [&_.maplibregl-ctrl-group>button:hover]:bg-accent!",
				"[&_.maplibregl-ctrl-icon]:grayscale dark:[&_.maplibregl-ctrl-icon]:invert",
				"[&_.maplibregl-popup-close-button]:type-label! [&_.maplibregl-popup-close-button]:rounded-none! [&_.maplibregl-popup-close-button]:bg-popover! [&_.maplibregl-popup-close-button]:p-1! [&_.maplibregl-popup-close-button]:text-popover-foreground!",
				"[&_.maplibregl-popup-close-button:focus-visible]:outline-none! [&_.maplibregl-popup-close-button:focus-visible]:ring-1! [&_.maplibregl-popup-close-button:focus-visible]:ring-inset! [&_.maplibregl-popup-close-button:focus-visible]:ring-ring! [&_.maplibregl-popup-close-button:hover]:bg-accent!",
			)}
		>
			<MapLibre
				initialViewState={initialViewState}
				mapStyle={mapStyle}
				locale={locale}
				renderWorldCopies={false}
				{...props}
			>
				{children}
			</MapLibre>
		</div>
	);
}
