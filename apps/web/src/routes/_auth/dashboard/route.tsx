import { Badge } from "@hack-the-andes-project/ui/components/badge";
import { DashboardSidebar } from "@hack-the-andes-project/ui/components/dashboard-sidebar";
import { Separator } from "@hack-the-andes-project/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@hack-the-andes-project/ui/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import {
	ALERT_REFETCH_INTERVAL_MS,
	SEEN_ALERTS_STORAGE_PREFIX,
} from "@/constants";
import { DASHBOARD_NAVIGATION } from "@/lib/dashboard-navigation";
import { useFleetQueries } from "@/lib/fleet-queries";

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const fleetQueries = useFleetQueries();
	const navigate = useNavigate();
	const { session } = Route.useRouteContext();
	const alertsQuery = useQuery({
		...fleetQueries.openAlerts,
		refetchInterval: ALERT_REFETCH_INTERVAL_MS,
	});
	const seenAlerts = useRef({
		scope: "",
		ids: new Set<string>(),
		storageAvailable: true,
	});
	const sessionScope = `${session.data?.session.id}:${session.data?.session.activeOrganizationId}`;

	useEffect(() => {
		if (!alertsQuery.data) return;
		const storageKey = `${SEEN_ALERTS_STORAGE_PREFIX}:${sessionScope}`;
		if (seenAlerts.current.scope !== sessionScope) {
			seenAlerts.current = {
				scope: sessionScope,
				ids: new Set<string>(),
				storageAvailable: true,
			};
			try {
				const storedIds: unknown = JSON.parse(
					sessionStorage.getItem(storageKey) ?? "[]",
				);
				if (Array.isArray(storedIds)) {
					seenAlerts.current.ids = new Set(
						storedIds.filter((id): id is string => typeof id === "string"),
					);
				}
			} catch {
				seenAlerts.current.storageAvailable = false;
			}
		}
		for (const alert of alertsQuery.data) {
			if (seenAlerts.current.ids.has(alert.id)) continue;
			seenAlerts.current.ids.add(alert.id);
			toast.warning(alert.title, {
				id: `${sessionScope}:${alert.id}`,
				description: `${alert.vehicleName ?? "Vehículo"} · ${alert.message}`,
				action: {
					label: "Ver alertas",
					onClick: () => navigate({ to: "/dashboard/alerts" }),
				},
			});
		}
		if (seenAlerts.current.storageAvailable) {
			try {
				sessionStorage.setItem(
					storageKey,
					JSON.stringify([...seenAlerts.current.ids]),
				);
			} catch {
				seenAlerts.current.storageAvailable = false;
			}
		}
	}, [alertsQuery.data, sessionScope, navigate]);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const navigationItems = DASHBOARD_NAVIGATION.map((item) => ({
		id: item.to,
		label: item.label,
		badgeCount:
			item.to === "/dashboard/alerts" ? alertsQuery.data?.length : undefined,
		icon: item.icon,
		link: <Link to={item.to} />,
		active: item.exact
			? pathname === item.to || pathname === `${item.to}/`
			: pathname === item.to || pathname.startsWith(`${item.to}/`),
	}));

	return (
		<SidebarProvider className="h-svh overflow-hidden">
			<DashboardSidebar
				items={navigationItems}
				homeLink={<Link to="/dashboard" />}
				footer={<UserMenu />}
			/>
			<SidebarInset className="min-w-0 overflow-hidden">
				<header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
					<SidebarTrigger aria-label="Abrir o cerrar navegación" />
					<Separator orientation="vertical" className="h-4" />
					<h1 className="type-heading min-w-0 truncate">
						{navigationItems.find((item) => item.active)?.label ??
							"Centro de operaciones"}
					</h1>
					<div className="ml-auto flex shrink-0 items-center gap-2">
						<Badge variant="outline">Perú</Badge>
						<LanguageToggle />
						<ModeToggle />
					</div>
				</header>
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
