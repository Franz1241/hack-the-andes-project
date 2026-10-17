import type { LineString } from "geojson";

import {
	FLEET_ALTERNATIVE_DASH_WIDTH_RATIOS,
	FLEET_ALTERNATIVE_ROUTE_COLOR,
	FLEET_ROUTE_COLOR,
	FLEET_ROUTE_SOURCE_PREFIX,
	FLEET_ROUTE_WIDTH_PX,
} from "./map-constants";
import { Layer, Source } from "./map-view";

export interface FleetRouteLayerProps {
	id: string;
	geometry: LineString;
	alternative?: boolean;
}

export function FleetRouteLayer({
	id,
	geometry,
	alternative = false,
}: FleetRouteLayerProps) {
	const sourceId = `${FLEET_ROUTE_SOURCE_PREFIX}${id}`;
	return (
		<Source key={sourceId} id={sourceId} type="geojson" data={geometry}>
			<Layer
				id={`${sourceId}-line`}
				type="line"
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": alternative
						? FLEET_ALTERNATIVE_ROUTE_COLOR
						: FLEET_ROUTE_COLOR,
					"line-width": FLEET_ROUTE_WIDTH_PX,
					...(alternative
						? { "line-dasharray": FLEET_ALTERNATIVE_DASH_WIDTH_RATIOS }
						: {}),
				}}
			/>
		</Source>
	);
}
