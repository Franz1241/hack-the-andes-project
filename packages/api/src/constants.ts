export const MAX_LOGGED_ID_CHARS = 64;

export const MIN_FLEET_TEXT_LENGTH_CHARS = 1;
export const SINGLE_RESULT_LIMIT_ROWS = 1;
export const VEHICLE_IMPORT_BATCH_SIZE_ROWS = 250;
export const CONNECTION_STATUS_ACTIVE = "active";
export const CONNECTION_STATUS_ERROR = "error";
export const TRIP_STATUS_ACTIVE = "active";
export const TRIP_STATUS_CANCELLED = "cancelled";
export const TRIP_STATUS_COMPLETED = "completed";
export const ALERT_STATUS_OPEN = "open";
export const ALERT_STATUS_ACKNOWLEDGED = "acknowledged";
export const CONNECTION_NOT_FOUND_MESSAGE = "No encontramos esa conexión GPS.";
export const CREDENTIALS_VALIDATION_FAILED_MESSAGE =
	"No pudimos validar las credenciales GPS. Revisa los datos y los permisos de acceso del proveedor.";
export const VEHICLE_IMPORT_FAILED_MESSAGE =
	"La conexión GPS se guardó, pero no pudimos importar sus vehículos. Revisa el acceso del proveedor e inténtalo de nuevo.";
export const VEHICLE_POSITION_REQUIRED_MESSAGE =
	"Elige un vehículo de tu organización que ya tenga una posición GPS antes de crear el viaje.";
export const ROUTING_FAILED_MESSAGE =
	"No pudimos calcular una ruta por carretera hasta este destino. Revisa el destino e inténtalo de nuevo.";
export const DEMO_VEHICLE_REQUIRED_MESSAGE =
	"Las rutas demo solo están disponibles para camiones de una flota demo con posición GPS.";
export const DEMO_HAZARD_ROUTE_NOT_FOUND_MESSAGE =
	"No encontramos un incidente activo en carretera cerca de este camión. Prueba con otro camión o marca el destino en el mapa.";
export const DEMO_CLEAR_ROUTE_NOT_FOUND_MESSAGE =
	"No encontramos una ruta sin incidentes cerca de este camión. Prueba con otro camión o marca el destino en el mapa.";
export const TRIP_NOT_FOUND_MESSAGE = "No encontramos ese viaje.";
export const TRIP_NOT_ACTIVE_MESSAGE =
	"Solo se pueden cancelar o completar viajes activos.";
export const ALERT_NOT_FOUND_MESSAGE = "No encontramos esa alerta.";
export const ALERT_NOT_OPEN_MESSAGE =
	"Solo se pueden confirmar alertas abiertas.";

export const DEFAULT_INCIDENT_LIMIT_ROWS = 500;
export const MAX_INCIDENT_LIMIT_ROWS = 2000;
export const DEFAULT_NEWS_LIMIT_ROWS = 50;
export const MAX_NEWS_LIMIT_ROWS = 200;
export const DEFAULT_NEWS_RELEVANT_ONLY = true;
export const SCRAPER_ACTIVE = true;

export const MIN_LATITUDE_DEG = -90;
export const MAX_LATITUDE_DEG = 90;
export const MIN_LONGITUDE_DEG = -180;
export const MAX_LONGITUDE_DEG = 180;
export const INVALID_BOUNDING_BOX_MESSAGE =
	"Bounding box must have west <= east and south <= north.";

export const GEOJSON_TYPE_PROPERTY = "type";
export const GEOJSON_POINT = "Point";
export const GEOJSON_MULTI_POINT = "MultiPoint";
export const GEOJSON_LINE_STRING = "LineString";
export const GEOJSON_MULTI_LINE_STRING = "MultiLineString";
export const GEOJSON_POLYGON = "Polygon";
export const GEOJSON_MULTI_POLYGON = "MultiPolygon";
export const GEOJSON_GEOMETRY_COLLECTION = "GeometryCollection";

// Procedures reachable without a session. The server's global auth guard lets
// these through, and the web batch link keeps them out of batches so a public
// call never rides inside a guarded `/rpc/__batch__` request.
export const PUBLIC_PROCEDURE_PATHS: ReadonlySet<string> = new Set([
	"healthCheck",
]);
