import { MIN_PASSWORD_LENGTH_CHARS } from "@hack-the-andes-project/business/constants";
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

export const ALERT_REFETCH_INTERVAL_MS = 30_000;
export const FLEET_REFETCH_INTERVAL_MS = 120_000;
export const SEEN_ALERTS_STORAGE_PREFIX = "illapa-seen-alerts-v1";

export const TOO_MANY_REQUESTS_STATUS = 429;
export const DEFAULT_AUTH_ERROR_MESSAGE =
	"No pudimos completar la solicitud. Inténtalo de nuevo.";
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
	INVALID_EMAIL: "Ingresa un correo válido.",
	USER_ALREADY_EXISTS: "Ya existe una cuenta con este correo.",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		"Ya existe una cuenta con este correo.",
	PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH_CHARS} caracteres.`,
	PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
};
export const RATE_LIMITED_AUTH_MESSAGE =
	"Demasiados intentos. Espera un momento e inténtalo de nuevo.";
