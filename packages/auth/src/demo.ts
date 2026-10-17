import {
	DEMO_ACCOUNT_EMAIL,
	DEMO_ACCOUNT_NAME,
	DEMO_SIGN_IN_AUTH_PATH,
	isDemoAccountEmail,
} from "@hack-the-andes-project/business/demo-account";
import type { BetterAuthPlugin } from "better-auth";
import {
	APIError,
	createAuthEndpoint,
	createAuthMiddleware,
	getSessionFromCtx,
} from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";

import {
	DEMO_BLOCKED_AUTH_PATHS,
	DEMO_CHANGE_FORBIDDEN_MESSAGE,
	DEMO_RATE_LIMIT_MAX_REQUESTS,
	DEMO_RATE_LIMIT_WINDOW_S,
} from "./constants";

export interface DemoAuthPathContext {
	path?: string;
}

export const demoAccess = {
	id: "demo-access",
	endpoints: {
		signInDemo: createAuthEndpoint(
			DEMO_SIGN_IN_AUTH_PATH,
			{ method: "POST" },
			async (context) => {
				const adapter = context.context.internalAdapter;
				let user = (await adapter.findUserByEmail(DEMO_ACCOUNT_EMAIL))?.user;
				if (!user) {
					try {
						user = await adapter.createUser(
							{
								email: DEMO_ACCOUNT_EMAIL,
								name: DEMO_ACCOUNT_NAME,
								emailVerified: true,
							},
							{ method: "demo" },
						);
					} catch (error) {
						user = (await adapter.findUserByEmail(DEMO_ACCOUNT_EMAIL))?.user;
						if (!user) throw error;
					}
				}
				const session = await adapter.createSession(user.id);
				if (!session)
					throw new APIError("INTERNAL_SERVER_ERROR", {
						message: "No se pudo iniciar la demo.",
					});
				await setSessionCookie(context, { user, session });
				return context.json({ success: true });
			},
		),
	},
	hooks: {
		before: [
			{
				matcher: (context: DemoAuthPathContext) =>
					Boolean(context.path && DEMO_BLOCKED_AUTH_PATHS.has(context.path)),
				handler: createAuthMiddleware(async (context) => {
					const session = await getSessionFromCtx(context);
					if (isDemoAccountEmail(session?.user.email)) {
						throw new APIError("FORBIDDEN", {
							message: DEMO_CHANGE_FORBIDDEN_MESSAGE,
						});
					}
				}),
			},
		],
	},
	rateLimit: [
		{
			pathMatcher: (path) => path === DEMO_SIGN_IN_AUTH_PATH,
			window: DEMO_RATE_LIMIT_WINDOW_S,
			max: DEMO_RATE_LIMIT_MAX_REQUESTS,
		},
	],
} satisfies BetterAuthPlugin;
