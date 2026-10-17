export const MAX_LOGGED_ID_CHARS = 64;
export const MAX_LOGGED_ERROR_MESSAGE_CHARS = 256;

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
