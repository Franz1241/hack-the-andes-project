import type { RouteRiskHorizon } from "@hack-the-andes-project/business/route-review/risk";

export const FIXTURE_LATENCY_MS = 700;
export const FIXTURE_HORIZONS = [
	"now",
	"24h",
] as const satisfies readonly RouteRiskHorizon[];
export const FIXTURE_ORGANIZATION_ID = "fixture-organization";
export const FIXTURE_GPS_CONNECTION_ID = "fixture-demo-gps";
export const FIXTURE_STORAGE_KEY = "illapa-route-review-fixtures-v1";
export const ISO_DATE_PATTERN =
	/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const MODERATE_RISK_MIN_SCORE = 35;
export const HIGH_RISK_MIN_SCORE = 55;
export const CRITICAL_RISK_MIN_SCORE = 75;
