export const PERU_CENTER_LATITUDE_DEG = -9.19;
export const PERU_CENTER_LONGITUDE_DEG = -75.0152;
export const PERU_INITIAL_ZOOM_LEVEL = 5;
export const INCIDENT_FILL_OPACITY_RATIO = 0.22;
export const INCIDENT_LINE_WIDTH_PX = 3;
export const INCIDENT_POINT_RADIUS_PX = 6;
export const INCIDENT_POINT_STROKE_WIDTH_PX = 2;
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

export const FLEET_ROUTE_WIDTH_PX = 4;
export const FLEET_ALTERNATIVE_DASH_WIDTH_RATIOS = [2, 2];
export const FLEET_ROUTE_SOURCE_PREFIX = "fleet-route-";
export const FLEET_HAZARD_SOURCE_ID = "fleet-hazard";
export const FLEET_HAZARD_FILL_LAYER_ID = "fleet-hazard-area";
export const FLEET_HAZARD_LINE_LAYER_ID = "fleet-hazard-line";
export const FLEET_HAZARD_POINT_LAYER_ID = "fleet-hazard-point";
export const FLEET_MAP_PADDING_PX = 48;
export const FLEET_MAP_MAX_ZOOM_LEVEL = 13;
export const FLEET_MAP_FIT_DURATION_MS = 0;

export const MAP_SPANISH_LOCALE = {
	"Map.Title": "Mapa",
	"Marker.Title": "Marcador del mapa",
	"NavigationControl.ZoomIn": "Acercar",
	"NavigationControl.ZoomOut": "Alejar",
	"NavigationControl.ResetBearing":
		"Arrastra para girar el mapa o pulsa para orientar al norte",
	"AttributionControl.ToggleAttribution": "Mostrar créditos del mapa",
	"Popup.Close": "Cerrar detalle",
};
