import { Toaster } from "@hack-the-andes-project/ui/components/sonner";
import { cn } from "@hack-the-andes-project/ui/lib/utils";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import type { orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Illapa",
			},
			{
				name: "description",
				content: "Fleet weather and route intelligence for Peru.",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isDashboard = useRouterState({
		select: (state) =>
			state.location.pathname === "/dashboard" ||
			state.location.pathname.startsWith("/dashboard/"),
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div
					className={cn(
						"min-h-svh",
						!isDashboard && "grid grid-rows-[auto_1fr]",
					)}
				>
					{!isDashboard && <Header />}
					<Outlet />
				</div>
				<Toaster richColors />
			</ThemeProvider>
			{import.meta.env.DEV && (
				<>
					<TanStackRouterDevtools position="bottom-left" />
					<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
				</>
			)}
		</>
	);
}
