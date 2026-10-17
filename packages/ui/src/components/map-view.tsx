import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import type { ComponentProps } from "react";
import MapLibre from "react-map-gl/maplibre";

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
		<MapLibre
			initialViewState={initialViewState}
			mapStyle={mapStyle}
			locale={locale}
			renderWorldCopies={false}
			{...props}
		>
			{children}
		</MapLibre>
	);
}
