import { Toaster } from "@hack-the-andes-project/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

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
				content: "Clima, incidencias y rutas para flotas de carga en el Perú.",
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
	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				<div className="min-h-svh">
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
