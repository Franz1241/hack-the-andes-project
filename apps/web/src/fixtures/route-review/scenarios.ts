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
const UP_TO_THREE_AXLES_RESTRICTION =
	"Transitabilidad de vehículos ligeros y medianos (hasta 3 ejes)";

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
				id: "pe22_central:senamhi-rain",
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
		id: "sutran:carretera_central_ruta_1",
		routeKey: "sutran_ruta_1",
		source: "sutran",
		name: "Ruta 1 · Huaura – Oyón – Ambo – Dv. Pasco",
		roadCodes: [],
		maxAxleCount: 3,
		restriction: UP_TO_THREE_AXLES_RESTRICTION,
		baseScores: { now: 22, "24h": 30 },
		hotspots: [],
		recommendation: {
			action: "continue",
			rule: "nothing_relevant",
			suggestedDelayHours: null,
			expectedDelayS: null,
		},
		signals: [],
		explanation:
			"No hay cierres, restricciones ni lluvias relevantes en esta ruta. Es el desvío más largo: suma unos 400 km frente a la Carretera Central.",
	},
	{
		id: "sutran:carretera_central_ruta_2",
		routeKey: "sutran_ruta_2",
		source: "sutran",
		name: "Ruta 2 · Huaral – Acos – Huayllay – Unish",
		roadCodes: [],
		maxAxleCount: 3,
		restriction: UP_TO_THREE_AXLES_RESTRICTION,
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
				id: "carretera_central_ruta_2:sutran-night-restriction",
				kind: "confirmed",
				title: "Paso restringido en Acos por trabajos en la vía",
				detail: "Sin paso de 18:00 a 06:00.",
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
			"SUTRAN restringe el paso en Acos de 18:00 a 06:00 por trabajos en la vía. Calcula hasta 1 h 30 min de espera si llegas dentro de ese horario.",
	},
	{
		id: "sutran:carretera_central_ruta_3",
		routeKey: "sutran_ruta_3",
		source: "sutran",
		name: "Ruta 3 · Lima – Canta – Huayllay – Unish – Dv. Pasco",
		roadCodes: [],
		maxAxleCount: 5,
		restriction:
			"Transitabilidad de vehículos ligeros, medianos y grandes (hasta 5 ejes)",
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
				id: "carretera_central_ruta_3:sutran-landslide",
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
				id: "carretera_central_ruta_3:senamhi-la-viuda",
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
			"SUTRAN reporta el tránsito interrumpido por un deslizamiento en el km 102 de la vía Lima–Canta, sin hora estimada de reapertura. Este desvío no es transitable mientras siga cerrado.",
	},
	{
		id: "sutran:carretera_central_ruta_4",
		routeKey: "sutran_ruta_4",
		source: "sutran",
		name: "Ruta 4 · Cañete – Lunahuaná – Dv. Yauyos – Chupaca",
		roadCodes: ["PE-1S", "PE-24"],
		maxAxleCount: 3,
		restriction: UP_TO_THREE_AXLES_RESTRICTION,
		baseScores: { now: 14, "24h": 18 },
		hotspots: [{ fromKm: 180, toKm: 235, scores: { now: 24, "24h": 26 } }],
		recommendation: {
			action: "continue",
			rule: "baseline_only",
			suggestedDelayHours: null,
			expectedDelayS: null,
		},
		signals: [
			{
				id: "carretera_central_ruta_4:ana-river",
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
			"No hay cierres confirmados ni lluvias fuertes previstas. El tramo Lunahuaná–Catahuasi está expuesto a crecidas del río Cañete en temporada de lluvias.",
	},
	{
		id: "sutran:carretera_central_ruta_5",
		routeKey: "sutran_ruta_5",
		source: "sutran",
		name: "Ruta 5 · Pisco – Pámpano – Santa Inés – Huancavelica – Huancayo",
		roadCodes: ["PE-1S", "PE-28A", "PE-26", "PE-3S"],
		maxAxleCount: null,
		restriction: null,
		baseScores: { now: 16, "24h": 20 },
		hotspots: [{ fromKm: 380, toKm: 430, scores: { now: 30, "24h": 44 } }],
		recommendation: {
			action: "continue",
			rule: "baseline_only",
			suggestedDelayHours: null,
			expectedDelayS: null,
		},
		signals: [
			{
				id: "carretera_central_ruta_5:senamhi-chonta",
				kind: "forecast",
				title: "Nevada ligera en el abra Chonta",
				detail: "Aviso amarillo: menos de 5 cm de nieve.",
				source: "SENAMHI",
				sourceUrl: SENAMHI_URL,
				observedMinutesAgo: 40,
				validFromHoursAfterDeparture: 8,
				validUntilHoursAfterDeparture: 20,
				roadStatus: null,
				incidentCategory: "weather",
				fromKm: 380,
				toKm: 430,
			},
			{
				id: "carretera_central_ruta_5:senamhi-heladas",
				kind: "baseline",
				title: "Tramo sobre 4,500 m con heladas frecuentes",
				detail: null,
				source: "SENAMHI",
				sourceUrl: SENAMHI_URL,
				observedMinutesAgo: 43_200,
				validFromHoursAfterDeparture: null,
				validUntilHoursAfterDeparture: null,
				roadStatus: null,
				incidentCategory: null,
				fromKm: 380,
				toKm: 430,
			},
		],
		explanation:
			"Es el único desvío oficial sin límite de ejes. El abra Chonta tiene nevada ligera prevista y heladas frecuentes: riesgo moderado, sin cierres. Suma unos 320 km frente a la Carretera Central.",
	},
];
