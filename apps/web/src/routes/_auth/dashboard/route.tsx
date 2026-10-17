import { Badge } from "@hack-the-andes-project/ui/components/badge";
import { DashboardSidebar } from "@hack-the-andes-project/ui/components/dashboard-sidebar";
import { Separator } from "@hack-the-andes-project/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@hack-the-andes-project/ui/components/sidebar";
import {
	createFileRoute,
	Link,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";

import { ModeToggle } from "@/components/mode-toggle";
import UserMenu from "@/components/user-menu";
import { DASHBOARD_NAVIGATION } from "@/lib/dashboard-navigation";

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const navigationItems = DASHBOARD_NAVIGATION.map((item) => ({
		id: item.to,
		label: item.label,
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
				footer={
					<>
						<UserMenu />
						<ModeToggle />
					</>
				}
			/>
			<SidebarInset className="min-w-0 overflow-hidden">
				<header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
					<SidebarTrigger aria-label="Abrir o cerrar navegación" />
					<Separator orientation="vertical" className="h-4" />
					<h1 className="font-heading font-medium text-sm">
						{navigationItems.find((item) => item.active)?.label ??
							"Centro de operaciones"}
					</h1>
					<Badge variant="outline" className="ml-auto">
						Perú
					</Badge>
				</header>
				<div className="flex min-h-0 flex-1 flex-col overflow-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
