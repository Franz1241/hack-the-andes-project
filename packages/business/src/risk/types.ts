import type {
	RiskComponents,
	RiskLevel,
} from "@hack-the-andes-project/db/schema/risk";
import type { IncidentSeverity } from "@hack-the-andes-project/db/schema/scraper";

export interface SegmentStaticFeatures {
	terrainSlopeDeg: number | null;
	massMovementSusceptibility: number | null;
	floodSusceptibility: number | null;
	waterDistanceM: number | null;
	historicalEventCount: number;
}

export interface SegmentConditions {
	// Wettest forecast day inside the horizon, not the horizon total, so 24 h
	// and 72 h scores stay on the same scale.
	forecastPrecipitationMm: number | null;
	antecedentPrecipitationMm: number | null;
	officialAlertSeverity: IncidentSeverity | null;
}

export interface SegmentRiskScore {
	score: number;
	level: RiskLevel;
	components: RiskComponents;
}
