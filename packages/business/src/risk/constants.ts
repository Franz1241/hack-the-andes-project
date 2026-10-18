import type { IncidentSeverity } from "@hack-the-andes-project/db/schema/scraper";

export const HEURISTIC_MODEL_VERSION = "heuristic-v1";

export const MASS_MOVEMENT_MIN_CLASS = 1;
export const MASS_MOVEMENT_MAX_CLASS = 5;
export const FLOOD_MIN_CLASS = 1;
export const FLOOD_MAX_CLASS = 4;
export const MISSING_FEATURE_PRIOR = 0.5;

export const SLOPE_SATURATION_DEG = 45;
export const WATER_PROXIMITY_RANGE_M = 1_000;
export const HISTORY_SATURATION_EVENTS = 5;
export const HISTORY_RADIUS_M = 1_000;

// SENAMHI classifies >20 mm/day as extreme rain for most of the central
// Andes; saturating a little above it keeps the coast and sierra comparable.
export const FORECAST_RAIN_SATURATION_MM_PER_DAY = 25;
export const ANTECEDENT_RAIN_SATURATION_MM = 60;
export const ANTECEDENT_RAIN_WINDOW_DAYS = 3;
export const ANTECEDENT_RAIN_TRIGGER_WEIGHT = 0.5;

export const STATIC_WEIGHTS = {
	massMovement: 0.4,
	slope: 0.2,
	floodExposure: 0.25,
	history: 0.15,
} as const;

// Susceptible terrain keeps a baseline even without rain (rockfall, old
// slides), but rain is what turns susceptibility into a near-term risk.
export const DRY_TRIGGER_FLOOR = 0.2;
export const ENVIRONMENTAL_WEIGHT = 0.9;
export const OFFICIAL_ALERT_WEIGHT = 0.3;

export const OFFICIAL_ALERT_FACTOR: Record<IncidentSeverity, number> = {
	info: 0.2,
	warning: 0.6,
	critical: 1,
};

export const RISK_SCORE_MAX = 100;
export const RISK_LEVEL_MIN_SCORES = {
	moderate: 25,
	high: 50,
	very_high: 75,
} as const;
