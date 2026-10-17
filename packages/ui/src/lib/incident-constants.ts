export const INCIDENT_CATEGORY_LABELS = {
	road_accident: "Accidente vial",
	road_works: "Obras en la vía",
	road_block: "Bloqueo de vía",
	landslide: "Deslizamiento",
	flood: "Inundación",
	fire: "Incendio",
	wildfire: "Incendio forestal",
	earthquake: "Sismo",
	weather: "Tiempo adverso",
	medical: "Emergencia médica",
	rescue: "Rescate",
	hazmat: "Materiales peligrosos",
	rain_warning: "Aviso de lluvia",
	flood_warning: "Aviso de inundación",
	other: "Otros",
};

export const INCIDENT_SEVERITY_LABELS = {
	critical: "Crítica",
	warning: "Precaución",
	info: "Informativa",
};

export const INCIDENT_SEVERITY_COLORS = {
	critical: "#e11d48",
	warning: "#d97706",
	info: "#0284c7",
} satisfies Record<keyof typeof INCIDENT_SEVERITY_LABELS, string>;

export const INCIDENT_SEVERITY_OPTIONS: (keyof typeof INCIDENT_SEVERITY_LABELS)[] =
	["critical", "warning", "info"];

export const INCIDENT_CATEGORY_OPTIONS = Object.entries(
	INCIDENT_CATEGORY_LABELS,
).map(([value, label]) => ({ value, label }));
