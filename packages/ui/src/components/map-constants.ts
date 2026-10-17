export const PERU_CENTER_LATITUDE_DEG = -9.19;
export const PERU_CENTER_LONGITUDE_DEG = -75.0152;
export const PERU_INITIAL_ZOOM_LEVEL = 5;
export const INCIDENT_FILL_OPACITY_RATIO = 0.22;
export const INCIDENT_LINE_WIDTH_PX = 3;
export const INCIDENT_POINT_RADIUS_PX = 6;
export const INCIDENT_POINT_STROKE_WIDTH_PX = 2;
export const INCIDENT_POINT_STROKE_COLOR = "#ffffff";
export const INCIDENT_GEOMETRY_SOURCE_ID = "incidents";
export const INCIDENT_FILL_LAYER_ID = "incident-areas";
export const INCIDENT_LINE_LAYER_ID = "incident-lines";
export const INCIDENT_POINT_LAYER_ID = "incident-points";
export const INCIDENT_INTERACTIVE_LAYER_IDS = [
	INCIDENT_FILL_LAYER_ID,
	INCIDENT_LINE_LAYER_ID,
	INCIDENT_POINT_LAYER_ID,
];
export const OPENFREEMAP_STYLE_URL =
	"https://tiles.openfreemap.org/styles/liberty";

export const PERU_INITIAL_VIEW_STATE = {
	latitude: PERU_CENTER_LATITUDE_DEG,
	longitude: PERU_CENTER_LONGITUDE_DEG,
	zoom: PERU_INITIAL_ZOOM_LEVEL,
};
