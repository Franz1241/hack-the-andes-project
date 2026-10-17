import {
	Avatar,
	AvatarFallback,
} from "@hack-the-andes-project/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hack-the-andes-project/ui/components/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hack-the-andes-project/ui/components/sidebar";
import { Skeleton } from "@hack-the-andes-project/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { USER_INITIALS_CHARACTER_COUNT } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";

interface UserMenuProps {
	collapsed?: boolean;
}

export default function UserMenu({ collapsed = false }: UserMenuProps) {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<Skeleton className={collapsed ? "size-8 rounded-full" : "h-14 w-full"} />
		);
	}

	if (!session) {
		return (
			<SidebarMenuButton
				render={<Link to="/login" />}
				tooltip={m.account_sign_in()}
				aria-label={m.account_sign_in()}
			>
				<Avatar size="sm">
					<AvatarFallback>?</AvatarFallback>
				</Avatar>
				{!collapsed && <span>{m.account_sign_in()}</span>}
			</SidebarMenuButton>
		);
	}

	const initials = session.user.name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, USER_INITIALS_CHARACTER_COUNT)
		.toUpperCase();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								tooltip={session.user.name}
								aria-label={m.account_menu({ name: session.user.name })}
								className={collapsed ? "justify-center p-0!" : undefined}
							/>
						}
					>
						<Avatar>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						{!collapsed && (
							<span className="flex min-w-0 flex-col gap-0.5 text-left">
								<span className="truncate font-medium">
									{session.user.name}
								</span>
								<span className="truncate text-muted-foreground text-xs">
									{session.user.email}
								</span>
							</span>
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent side={collapsed ? "right" : "top"} align="start">
						<DropdownMenuGroup>
							<DropdownMenuLabel>{m.account_title()}</DropdownMenuLabel>
							<DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={() => {
									authClient.signOut({
										fetchOptions: {
											onSuccess: () => {
												navigate({
													to: "/login",
												});
											},
										},
									});
								}}
							>
								{m.account_sign_out()}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
