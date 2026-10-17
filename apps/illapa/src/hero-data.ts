export type HazardState = "active" | "watch" | "social";

export interface HeroHazard {
	name: string;
	place: string;
	state: HazardState;
	longitude: number;
	latitude: number;
}

export const HERO_HAZARDS: HeroHazard[] = [
	{
		name: "Lluvias intensas, nivel rojo",
		place: "Piura y Tumbes",
		state: "active",
		longitude: -80.63,
		latitude: -5.19,
	},
	{
		name: "Río Chira sobre umbral",
		place: "Sullana",
		state: "active",
		longitude: -80.69,
		latitude: -4.9,
	},
	{
		name: "Huaico, Carretera Central restringida",
		place: "Chosica, km 38",
		state: "active",
		longitude: -76.7,
		latitude: -11.93,
	},
	{
		name: "Aviso de heladas",
		place: "Puno y Cusco alto",
		state: "watch",
		longitude: -70.02,
		latitude: -15.84,
	},
	{
		name: "Focos de incendio",
		place: "Madre de Dios",
		state: "watch",
		longitude: -69.19,
		latitude: -12.6,
	},
	{
		name: "Oleaje anómalo, puerto cerrado",
		place: "Matarani",
		state: "watch",
		longitude: -72.1,
		latitude: -17.0,
	},
	{
		name: "Bloqueo de vía",
		place: "Panamericana Sur, km 290",
		state: "social",
		longitude: -75.73,
		latitude: -14.07,
	},
	{
		name: "Paro regional anunciado",
		place: "Juliaca",
		state: "social",
		longitude: -70.13,
		latitude: -15.5,
	},
];

export const PANAMERICANA_NORTE_LIMA_PIURA: [number, number][] = [
	[-77.03, -12.05],
	[-77.61, -11.11],
	[-77.76, -10.75],
	[-78.3, -9.47],
	[-78.59, -9.07],
	[-79.03, -8.11],
	[-79.57, -7.4],
	[-79.84, -6.77],
	[-80.63, -5.19],
];

export interface FeedEntry {
	time: string;
	corridor: string;
	message: string;
	state: HazardState;
}

export const HERO_FEED: FeedEntry[] = [
	{
		time: "06:40",
		corridor: "Lima – Piura",
		message:
			"Lluvias nivel rojo en Piura hasta el jueves. 3 despachos programados pasan por la zona.",
		state: "active",
	},
	{
		time: "06:12",
		corridor: "Lima – La Oroya",
		message:
			"Huaico en Chosica. Carretera Central a un carril, demora estimada 4 h.",
		state: "active",
	},
	{
		time: "05:55",
		corridor: "Arequipa – Matarani",
		message: "Puerto cerrado por oleaje. Reapertura prevista mañana 10:00.",
		state: "watch",
	},
	{
		time: "Ayer",
		corridor: "Ica – Nasca",
		message: "Bloqueo anunciado en km 290 desde el lunes 08:00.",
		state: "social",
	},
];
