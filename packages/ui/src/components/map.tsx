import type { ComponentProps } from "react";
import MapLibre from "react-map-gl/maplibre";

import {
	OPENFREEMAP_STYLE_URL,
	PERU_INITIAL_VIEW_STATE,
} from "./map-constants";

import "maplibre-gl/dist/maplibre-gl.css";

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

function MapView({
	initialViewState = PERU_INITIAL_VIEW_STATE,
	mapStyle = OPENFREEMAP_STYLE_URL,
	children,
	...props
}: MapProps) {
	return (
		<MapLibre
			initialViewState={initialViewState}
			mapStyle={mapStyle}
			renderWorldCopies={false}
			{...props}
		>
			{children}
		</MapLibre>
	);
}

export { MapView as Map };
