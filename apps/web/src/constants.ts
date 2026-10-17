import { m } from "@/paraglide/messages";
export const SHOWCASE_SECTIONS = [
	{ id: "color", label: m.ds_nav_color },
	{ id: "tipografia", label: m.ds_nav_type },
	{ id: "espacio", label: m.ds_nav_spacing },
	{ id: "componentes", label: m.ds_nav_components },
	{ id: "riesgo", label: m.ds_risk_label },
	{ id: "datos", label: m.ds_nav_data },
	{ id: "criterios", label: m.ds_nav_guidelines },
	{ id: "panel", label: m.ds_panel_title },
];

interface RiskLevel {
	variant: "low" | "moderate" | "high" | "critical";
	label: () => string;
	colorName: () => string;
	fillClassName: string;
	inkClassName: string;
	recommendation: () => string;
}

export const RISK_LEVELS: RiskLevel[] = [
	{
		variant: "low",
		label: m.risk_low,
		colorName: m.risk_color_low,
		fillClassName: "bg-risk-low",
		inkClassName: "text-risk-low-foreground",
		recommendation: m.recommendation_continue,
	},
	{
		variant: "moderate",
		label: m.risk_moderate,
		colorName: m.risk_color_moderate,
		fillClassName: "bg-risk-moderate",
		inkClassName: "text-risk-moderate-foreground",
		recommendation: m.recommendation_monitor,
	},
	{
		variant: "high",
		label: m.risk_high,
		colorName: m.risk_color_high,
		fillClassName: "bg-risk-high",
		inkClassName: "text-risk-high-foreground",
		recommendation: m.recommendation_delay,
	},
	{
		variant: "critical",
		label: m.risk_critical,
		colorName: m.risk_color_critical,
		fillClassName: "bg-risk-critical",
		inkClassName: "text-risk-critical-foreground",
		recommendation: m.recommendation_reroute,
	},
];

interface RouteExample {
	id: string;
	name: () => string;
	risk: RiskLevel["variant"];
	riskLabel: () => string;
	horizon: () => string;
	cause: () => string;
	recommendation: () => string;
}

export const ROUTE_EXAMPLES: RouteExample[] = [
	{
		id: "PE-22",
		name: m.ds_route_central_name,
		risk: "critical",
		riskLabel: m.risk_critical,
		horizon: m.horizon_now,
		cause: m.ds_route_central_cause,
		recommendation: m.recommendation_reroute,
	},
	{
		id: "PE-1N",
		name: m.ds_route_north_name,
		risk: "high",
		riskLabel: m.risk_high,
		horizon: () => m.horizon_hours({ hours: "6" }),
		cause: m.ds_route_north_cause,
		recommendation: m.recommendation_delay,
	},
	{
		id: "PE-30C",
		name: m.ds_route_interoceanic_name,
		risk: "moderate",
		riskLabel: m.risk_moderate,
		horizon: () => m.horizon_hours({ hours: "24" }),
		cause: m.ds_route_interoceanic_cause,
		recommendation: m.recommendation_monitor,
	},
	{
		id: "PE-1S",
		name: m.ds_route_south_name,
		risk: "low",
		riskLabel: m.risk_low,
		horizon: m.horizon_now,
		cause: m.ds_route_south_cause,
		recommendation: m.recommendation_continue,
	},
	{
		id: "PE-3S",
		name: m.ds_route_sierra_name,
		risk: "high",
		riskLabel: m.risk_high,
		horizon: () => m.horizon_hours({ hours: "48" }),
		cause: m.ds_route_sierra_cause,
		recommendation: m.recommendation_monitor,
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

export const MINIMUM_NAME_LENGTH = 2;
export const MINIMUM_PASSWORD_LENGTH = 8;
