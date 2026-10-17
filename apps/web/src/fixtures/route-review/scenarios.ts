import type { RouteReviewSignal } from "@hack-the-andes-project/api/route-review-schemas";
import type {
	RouteCandidateSource,
	RouteRecommendation,
	RouteRecommendationRule,
	RouteSignalKind,
} from "@hack-the-andes-project/business/route-review/risk";

import type limaHuancayoRoutes from "./lima-huancayo-routes.json";

export interface HorizonScores {
	now: number;
	"24h": number;
}

interface FixtureHotspot {
	fromKm: number;
	toKm: number;
	scores: HorizonScores;
}

export interface FixtureSignal {
	id: string;
	kind: RouteSignalKind;
	title: string;
	detail: string | null;
	source: string;
	sourceUrl: string | null;
	observedMinutesAgo: number;
	validFromHoursAfterDeparture: number | null;
	validUntilHoursAfterDeparture: number | null;
	roadStatus: RouteReviewSignal["roadStatus"];
	incidentCategory: RouteReviewSignal["incidentCategory"];
	fromKm: number;
	toKm: number;
}

export interface FixtureScenario {
	id: string;
	routeKey: keyof typeof limaHuancayoRoutes;
	source: RouteCandidateSource;
	name: string;
	roadCodes: string[];
	maxAxleCount: number | null;
	restriction: string | null;
	baseScores: HorizonScores;
	hotspots: FixtureHotspot[];
	recommendation: {
		action: RouteRecommendation;
		rule: RouteRecommendationRule;
		suggestedDelayHours: number | null;
		expectedDelayS: number | null;
	};
	signals: FixtureSignal[];
	explanation: string;
}

const SENAMHI_URL = "https://www.senamhi.gob.pe";
const SUTRAN_URL = "https://www.sutran.gob.pe";
const INGEMMET_URL = "https://geocatmin.ingemmet.gob.pe";
const MTC_URL = "https://www.gob.pe/mtc";
const ANA_URL = "https://www.ana.gob.pe";

const HUAROCHIRI_RAIN_SIGNAL = {
	kind: "forecast",
	title: "Lluvia fuerte prevista en Huarochirí",
	detail: "Aviso naranja: 25 a 40 mm acumulados, con posibles huaicos.",
	source: "SENAMHI",
	sourceUrl: SENAMHI_URL,
	observedMinutesAgo: 40,
	validFromHoursAfterDeparture: 2,
	validUntilHoursAfterDeparture: 14,
	roadStatus: null,
	incidentCategory: "rain_warning",
} as const;

export const LIMA_HUANCAYO_SCENARIOS: FixtureScenario[] = [
	{
		id: "illapa:pe22_central",
		routeKey: "pe22_central",
		source: "illapa",
		name: "Carretera Central",
		roadCodes: ["PE-22"],
		maxAxleCount: null,
		restriction: null,
		baseScores: { now: 15, "24h": 20 },
		hotspots: [
			{ fromKm: 35, toKm: 80, scores: { now: 40, "24h": 40 } },
			{ fromKm: 70, toKm: 115, scores: { now: 30, "24h": 72 } },
			{ fromKm: 120, toKm: 140, scores: { now: 38, "24h": 38 } },
		],
		recommendation: {
			action: "delay",
			rule: "forecast_in_window",
			suggestedDelayHours: 18,
			expectedDelayS: null,
		},
		signals: [
			{
				...HUAROCHIRI_RAIN_SIGNAL,
				id: "pe22_central:senamhi-rain",
				fromKm: 70,
				toKm: 115,
			},
			{
				id: "pe22_central:ingemmet-huaicos",
				kind: "baseline",
				title: "Zona susceptible a huaicos entre Chosica y Matucana",
				detail: "Susceptibilidad alta a movimientos en masa.",
				source: "INGEMMET",
				sourceUrl: INGEMMET_URL,
				observedMinutesAgo: 129_600,
				validFromHoursAfterDeparture: null,
				validUntilHoursAfterDeparture: null,
				roadStatus: null,
				incidentCategory: null,
				fromKm: 35,
				toKm: 80,
			},
			{
				id: "pe22_central:mtc-ticlio",
				kind: "baseline",
				title: "Historial de accidentes en Ticlio",
				detail: "12 emergencias registradas en 2026 entre los km 120 y 140.",
				source: "MTC",
				sourceUrl: MTC_URL,
				observedMinutesAgo: 25_920,
				validFromHoursAfterDeparture: null,
				validUntilHoursAfterDeparture: null,
				roadStatus: null,
				incidentCategory: null,
				fromKm: 120,
				toKm: 140,
			},
		],
		explanation:
			"SENAMHI prevé lluvia fuerte en Huarochirí durante tu ventana de viaje, sobre un tramo con historial de huaicos entre Chosica y Matucana. Si sales 18 h más tarde, el tramo Matucana–Chicla baja a riesgo moderado.",
	},
	{
		id: "illapa:canta_huayllay",
		routeKey: "canta_huayllay",
		source: "illapa",
		name: "Lima – Canta – Huayllay – La Oroya",
		roadCodes: ["PE-3N", "PE-3S"],
		maxAxleCount: null,
		restriction: null,
		baseScores: { now: 18, "24h": 22 },
		hotspots: [
			{ fromKm: 98, toKm: 108, scores: { now: 90, "24h": 70 } },
			{ fromKm: 150, toKm: 190, scores: { now: 30, "24h": 58 } },
		],
		recommendation: {
			action: "reroute",
			rule: "confirmed_interruption",
			suggestedDelayHours: null,
			expectedDelayS: null,
		},
		signals: [
			{
				id: "canta_huayllay:sutran-landslide",
				kind: "confirmed",
				title: "Tránsito interrumpido por deslizamiento en el km 102",
				detail: "Maquinaria en la zona. Sin hora estimada de reapertura.",
				source: "SUTRAN",
				sourceUrl: SUTRAN_URL,
				observedMinutesAgo: 25,
				validFromHoursAfterDeparture: -6,
				validUntilHoursAfterDeparture: null,
				roadStatus: "interrumpido",
				incidentCategory: "landslide",
				fromKm: 98,
				toKm: 108,
			},
			{
				id: "canta_huayllay:senamhi-la-viuda",
				kind: "forecast",
				title: "Nevada y lluvia en el abra La Viuda",
				detail: null,
				source: "SENAMHI",
				sourceUrl: SENAMHI_URL,
				observedMinutesAgo: 40,
				validFromHoursAfterDeparture: 6,
				validUntilHoursAfterDeparture: 18,
				roadStatus: null,
				incidentCategory: "weather",
				fromKm: 150,
				toKm: 190,
			},
		],
		explanation:
			"SUTRAN reporta el tránsito interrumpido por un deslizamiento en el km 102 de la vía Lima–Canta, sin hora estimada de reapertura. Esta ruta no es transitable mientras siga cerrada.",
	},
	{
		id: "illapa:canete_yauyos",
		routeKey: "canete_yauyos",
		source: "illapa",
		name: "Cañete – Lunahuaná – Yauyos",
		roadCodes: ["PE-1S", "PE-24"],
		maxAxleCount: null,
		restriction: null,
		baseScores: { now: 14, "24h": 18 },
		hotspots: [{ fromKm: 180, toKm: 235, scores: { now: 30, "24h": 32 } }],
		recommendation: {
			action: "continue",
			rule: "baseline_only",
			suggestedDelayHours: null,
			expectedDelayS: null,
		},
		signals: [
			{
				id: "canete_yauyos:ana-river",
				kind: "baseline",
				title: "Tramo expuesto a crecidas del río Cañete",
				detail: "Entre Lunahuaná y Catahuasi la vía corre junto al cauce.",
				source: "ANA",
				sourceUrl: ANA_URL,
				observedMinutesAgo: 86_400,
				validFromHoursAfterDeparture: null,
				validUntilHoursAfterDeparture: null,
				roadStatus: null,
				incidentCategory: null,
				fromKm: 180,
				toKm: 235,
			},
		],
		explanation:
			"No hay cierres confirmados ni lluvias fuertes previstas. El tramo Lunahuaná–Catahuasi está expuesto a crecidas del río Cañete en temporada de lluvias. Es la ruta más larga, pero la de menor riesgo.",
	},
	{
		id: "sutran:huaral_acos",
		routeKey: "sutran_huaral_acos",
		source: "sutran",
		name: "Ruta alterna Huaral – Acos – Huayllay",
		roadCodes: [],
		maxAxleCount: null,
		restriction: null,
		baseScores: { now: 20, "24h": 26 },
		hotspots: [{ fromKm: 120, toKm: 135, scores: { now: 50, "24h": 50 } }],
		recommendation: {
			action: "monitor",
			rule: "confirmed_restriction",
			suggestedDelayHours: null,
			expectedDelayS: 5_400,
		},
		signals: [
			{
				id: "huaral_acos:sutran-night-restriction",
				kind: "confirmed",
				title: "Paso restringido para vehículos pesados en Acos",
				detail: "Trabajos en la vía: sin paso de 18:00 a 06:00.",
				source: "SUTRAN",
				sourceUrl: SUTRAN_URL,
				observedMinutesAgo: 90,
				validFromHoursAfterDeparture: -48,
				validUntilHoursAfterDeparture: 72,
				roadStatus: "restringido",
				incidentCategory: "road_works",
				fromKm: 120,
				toKm: 135,
			},
		],
		explanation:
			"SUTRAN restringe el paso de vehículos pesados en Acos de 18:00 a 06:00 por trabajos en la vía. Calcula hasta 1 h 30 min de espera si llegas dentro de ese horario.",
	},
	{
		id: "sutran:antioquia_huarochiri",
		routeKey: "sutran_antioquia_huarochiri",
		source: "sutran",
		name: "Ruta alterna Cieneguilla – Antioquía – Huarochirí",
		roadCodes: [],
		maxAxleCount: 2,
		restriction: "Solo vehículos de hasta 2 ejes.",
		baseScores: { now: 22, "24h": 26 },
		hotspots: [{ fromKm: 90, toKm: 170, scores: { now: 34, "24h": 68 } }],
		recommendation: {
			action: "delay",
			rule: "forecast_in_window",
			suggestedDelayHours: 18,
			expectedDelayS: null,
		},
		signals: [
			{
				...HUAROCHIRI_RAIN_SIGNAL,
				id: "antioquia_huarochiri:senamhi-rain",
				fromKm: 90,
				toKm: 170,
			},
		],
		explanation:
			"Desvío oficial de SUTRAN para vehículos de hasta 2 ejes. Cruza la misma zona de lluvia fuerte prevista en Huarochirí. Si sales 18 h más tarde, el riesgo baja a moderado.",
	},
];
