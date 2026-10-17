import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { incidentsRouter } from "./incidents";
import { newsRouter } from "./news";
import { poisRouter } from "./pois";

export const appRouter = {
	incidents: incidentsRouter,
	pois: poisRouter,
	news: newsRouter,
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session.user,
		};
	}),
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
