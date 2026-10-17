export const MAX_LOGGED_ID_CHARS = 64;
export const MAX_LOGGED_ERROR_MESSAGE_CHARS = 256;

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
export const CONNECTION_NOT_FOUND_MESSAGE = "GPS connection not found.";
export const CREDENTIALS_VALIDATION_FAILED_MESSAGE =
	"Unable to validate GPS credentials. Check the credentials and provider access.";
export const VEHICLE_IMPORT_FAILED_MESSAGE =
	"The GPS connection was saved, but its vehicles could not be imported. Check provider access and try again.";
export const VEHICLE_POSITION_REQUIRED_MESSAGE =
	"Select a vehicle in your organization with a latest GPS position before creating a trip.";
export const ROUTING_FAILED_MESSAGE =
	"Unable to calculate a driving route to this destination. Check the destination and try again.";
export const TRIP_NOT_FOUND_MESSAGE = "Trip not found.";
export const TRIP_NOT_ACTIVE_MESSAGE =
	"Only active trips can be cancelled or completed.";
export const ALERT_NOT_FOUND_MESSAGE = "Alert not found.";
export const ALERT_NOT_OPEN_MESSAGE = "Only open alerts can be acknowledged.";

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
