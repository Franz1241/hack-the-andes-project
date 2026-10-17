export const SHOWCASE_SECTIONS = [
	{ id: "color", label: "Color" },
	{ id: "tipografia", label: "Tipografía" },
	{ id: "espacio", label: "Espacio" },
	{ id: "componentes", label: "Componentes" },
	{ id: "riesgo", label: "Riesgo" },
	{ id: "criterios", label: "Criterios" },
	{ id: "panel", label: "Panel de rutas" },
];

interface RiskLevel {
	variant: "low" | "moderate" | "high" | "critical";
	label: string;
	colorName: string;
	fillClassName: string;
	inkClassName: string;
	recommendation: string;
}

export const RISK_LEVELS: RiskLevel[] = [
	{
		variant: "low",
		label: "Bajo",
		colorName: "Verde",
		fillClassName: "bg-risk-low",
		inkClassName: "text-risk-low-foreground",
		recommendation: "Continuar",
	},
	{
		variant: "moderate",
		label: "Moderado",
		colorName: "Amarillo",
		fillClassName: "bg-risk-moderate",
		inkClassName: "text-risk-moderate-foreground",
		recommendation: "Monitorear",
	},
	{
		variant: "high",
		label: "Alto",
		colorName: "Naranja",
		fillClassName: "bg-risk-high",
		inkClassName: "text-risk-high-foreground",
		recommendation: "Retrasar",
	},
	{
		variant: "critical",
		label: "Crítico",
		colorName: "Rojo",
		fillClassName: "bg-risk-critical",
		inkClassName: "text-risk-critical-foreground",
		recommendation: "Desviar",
	},
];

interface RouteExample {
	id: string;
	name: string;
	risk: RiskLevel["variant"];
	riskLabel: string;
	horizon: string;
	cause: string;
	recommendation: string;
}

export const ROUTE_EXAMPLES: RouteExample[] = [
	{
		id: "PE-22",
		name: "Carretera Central km 112 · La Oroya",
		risk: "critical",
		riskLabel: "Crítico",
		horizon: "Ahora",
		cause: "Huaico · cierre SUTRAN",
		recommendation: "Desviar",
	},
	{
		id: "PE-1N",
		name: "Panamericana Norte · Chiclayo–Piura",
		risk: "high",
		riskLabel: "Alto",
		horizon: "6 h",
		cause: "Lluvias intensas · aviso naranja",
		recommendation: "Retrasar",
	},
	{
		id: "PE-30C",
		name: "Interoceánica · Puerto Maldonado",
		risk: "moderate",
		riskLabel: "Moderado",
		horizon: "24 h",
		cause: "Lluvias en evaluación",
		recommendation: "Monitorear",
	},
	{
		id: "PE-1S",
		name: "Panamericana Sur · Lima–Ica",
		risk: "low",
		riskLabel: "Bajo",
		horizon: "Ahora",
		cause: "Sin incidentes reportados",
		recommendation: "Continuar",
	},
	{
		id: "PE-3S",
		name: "Longitudinal de la Sierra · Cusco–Abancay",
		risk: "high",
		riskLabel: "Alto",
		horizon: "48 h",
		cause: "Probabilidad de deslizamientos",
		recommendation: "Monitorear",
	},
];

export const SPACING_SCALE = [
	{ token: "1", size: "4 px", className: "w-1" },
	{ token: "2", size: "8 px", className: "w-2" },
	{ token: "3", size: "12 px", className: "w-3" },
	{ token: "4", size: "16 px", className: "w-4" },
	{ token: "6", size: "24 px", className: "w-6" },
	{ token: "8", size: "32 px", className: "w-8" },
	{ token: "12", size: "48 px", className: "w-12" },
	{ token: "16", size: "64 px", className: "w-16" },
];
