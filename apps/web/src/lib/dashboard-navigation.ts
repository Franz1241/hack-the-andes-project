import {
	BellIcon,
	MapIcon,
	NewspaperIcon,
	SettingsIcon,
	TruckIcon,
} from "@hack-the-andes-project/ui/components/icons";
import type { LinkProps } from "@tanstack/react-router";
import type { ComponentType } from "react";

interface DashboardNavigationEntry {
	to: NonNullable<LinkProps["to"]>;
	label: string;
	icon: ComponentType;
	exact?: boolean;
}

export const DASHBOARD_NAVIGATION: DashboardNavigationEntry[] = [
	{ to: "/dashboard", label: "Mapa", icon: MapIcon, exact: true },
	{ to: "/dashboard/fleet", label: "Flota", icon: TruckIcon },
	{ to: "/dashboard/alerts", label: "Alertas", icon: BellIcon },
	{ to: "/dashboard/news", label: "Noticias", icon: NewspaperIcon },
	{ to: "/dashboard/settings", label: "Configuración", icon: SettingsIcon },
];
