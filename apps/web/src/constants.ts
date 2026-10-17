import type {
	Incident,
	IncidentTimePreset,
} from "@hack-the-andes-project/ui/lib/incident";

export const INCIDENT_REFETCH_INTERVAL_MS = 60_000;
export const DEFAULT_INCIDENT_LIMIT_ROWS = 2_000;
export const DEFAULT_NEWS_LIMIT_ROWS = 50;
export const NEWS_REFETCH_INTERVAL_MS = 60_000;
export const NEWS_SKELETON_KEYS = ["lead", "second", "third", "fourth"];
export const LAST_DAY_DURATION_MS = 86_400_000;
export const LAST_WEEK_DURATION_MS = 604_800_000;
export const DEFAULT_SINCE_PRESET = "all";

interface SincePreset extends IncidentTimePreset {
	durationMs: number | null;
}

export const INCIDENT_SINCE_PRESETS: SincePreset[] = [
	{ value: "24h", label: "Últimas 24 h", durationMs: LAST_DAY_DURATION_MS },
	{ value: "7d", label: "Últimos 7 días", durationMs: LAST_WEEK_DURATION_MS },
	{ value: DEFAULT_SINCE_PRESET, label: "Todo el período", durationMs: null },
];

export const EMPTY_INCIDENTS: Incident[] = [];
