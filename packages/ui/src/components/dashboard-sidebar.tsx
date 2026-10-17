import { CloudLightningIcon } from "lucide-react";
import type { ComponentType, ReactElement, ReactNode } from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from "./sidebar";

export interface DashboardNavigationItem {
	id: string;
	label: string;
	icon: ComponentType;
	link: ReactElement;
	active: boolean;
	badgeCount?: number;
}

export interface DashboardSidebarProps {
	items: DashboardNavigationItem[];
	homeLink: ReactElement;
	footer: ReactNode;
}

export function DashboardSidebar({
	items,
	homeLink,
	footer,
}: DashboardSidebarProps) {
	const { setOpenMobile } = useSidebar();

	return (
		<Sidebar>
			<SidebarHeader className="p-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							render={homeLink}
							onClick={() => setOpenMobile(false)}
						>
							<CloudLightningIcon />
							<span className="flex flex-col gap-0.5">
								<span className="type-heading">illapa</span>
								<span className="type-label text-muted-foreground">
									Inteligencia en ruta
								</span>
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="type-label!">
						Centro de operaciones · Perú
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<nav aria-label="Navegación principal">
							<SidebarMenu>
								{items.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											render={item.link}
											isActive={item.active}
											aria-current={item.active ? "page" : undefined}
											onClick={() => setOpenMobile(false)}
										>
											<item.icon />
											<span className="font-medium font-sans text-sm">
												{item.label}
											</span>
										</SidebarMenuButton>
										{Boolean(item.badgeCount) && (
											<SidebarMenuBadge
												className="type-data!"
												aria-label={`${item.badgeCount} alertas abiertas`}
											>
												{item.badgeCount}
											</SidebarMenuBadge>
										)}
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</nav>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarSeparator />
			<SidebarFooter className="gap-3 p-4">
				<p className="type-label text-muted-foreground">
					Clima, vías y flota en un solo lugar.
				</p>
				<div className="flex min-w-0 items-center justify-between gap-2 [&>button:first-child]:min-w-0 [&>button:first-child]:truncate">
					{footer}
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
