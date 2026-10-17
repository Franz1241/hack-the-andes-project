export const HAZARD_BUFFER_M = 500;
export const LOOKAHEAD_M = 150_000;
export const OFF_ROUTE_THRESHOLD_M = 1_000;
export const MIN_SPEED_FOR_ETA_KMH = 5;
export const DEFAULT_OSRM_BASE_URL = "https://router.project-osrm.org";
export const ALTERNATIVE_MAX_DETOUR_RATIO = 1.6;
export const KMH_TO_MPS = 1000 / 3600;
export const MS_PER_SECOND = 1000;
export const TRIP_ARRIVAL_RADIUS_M = 300;
export const METERS_PER_KM = 1000;
export const SECONDS_PER_MINUTE = 60;
export const FLEET_WRITE_BATCH_SIZE_ROWS = 250;
export const HEX_RADIX = 16;
export const HEX_BYTE_LENGTH_CHARS = 2;
export const DEMO_NAME_MAX_LENGTH_CHARS = 120;
export const DEMO_COMPANY_MAX_LENGTH_CHARS = 160;
export const DEMO_PHONE_MAX_LENGTH_CHARS = 40;
export const DEMO_EMAIL_MAX_LENGTH_CHARS = 254;
export const MIN_PASSWORD_LENGTH_CHARS = 8;

export const POSITION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const POSITION_RETENTION_BATCH_SIZE_ROWS = 10_000;

export const ROUTING_REQUEST_TIMEOUT_MS = 15_000;
export const MIN_ROUTE_COORDINATES_COUNT = 2;

export const DEMO_TRIP_SCENARIOS = ["hazard", "clear"] as const;
export const DEMO_HAZARD_MIN_DISTANCE_M = 20_000;
export const DEMO_HAZARD_MAX_DISTANCE_M = 200_000;
export const DEMO_HAZARD_OVERSHOOT_M = 10_000;
export const DEMO_CLEAR_TRIP_DISTANCE_M = 60_000;
export const DEMO_CLEAR_TRIP_BEARINGS_DEG = [
	0, 45, 90, 135, 180, 225, 270, 315,
];
export const DEMO_TRIP_MIN_ROUTE_DISTANCE_M = 20_000;
export const DEMO_TRIP_MAX_ATTEMPTS_COUNT = 4;
