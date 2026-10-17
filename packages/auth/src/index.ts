import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { expo } from "@better-auth/expo";
import type { Database } from "@hack-the-andes-project/db";
import * as schema from "@hack-the-andes-project/db/schema/auth";
import { betterAuth } from "better-auth";

import {
	EXPO_DEV_ORIGINS,
	NATIVE_APP_SCHEME_ORIGIN,
	RATE_LIMIT_MAX_REQUESTS,
	RATE_LIMIT_WINDOW_S,
	SESSION_COOKIE_CACHE_MAX_AGE_S,
	SIGN_IN_RATE_LIMIT_MAX_REQUESTS,
	SIGN_UP_RATE_LIMIT_MAX_REQUESTS,
} from "./constants";
import { parseAllowedOrigins } from "./origins";
import { hashPassword, verifyPassword } from "./password";

export { parseAllowedOrigins } from "./origins";

export interface AuthConfig {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	ALLOWED_ORIGINS: string;
}

export function createAuth(env: AuthConfig, database: Database) {
	const isLocalServer = env.BETTER_AUTH_URL.startsWith("http://localhost");

	return betterAuth({
		database: drizzleAdapter(database, {
			provider: "mysql",
			schema,
		}),
		trustedOrigins: [
			...parseAllowedOrigins(env.ALLOWED_ORIGINS),
			NATIVE_APP_SCHEME_ORIGIN,
			// Expo Go and the Metro dev server only exist against a local server.
			...(isLocalServer ? EXPO_DEV_ORIGINS : []),
		],
		emailAndPassword: {
			enabled: true,
			password: { hash: hashPassword, verify: verifyPassword },
		},
		session: {
			cookieCache: {
				enabled: true,
				maxAge: SESSION_COOKIE_CACHE_MAX_AGE_S,
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		rateLimit: {
			enabled: true,
			// Workers keep no memory between isolates, so counters live in MySQL.
			storage: "database",
			window: RATE_LIMIT_WINDOW_S,
			max: RATE_LIMIT_MAX_REQUESTS,
			customRules: {
				// Every guarded request already resolves the session through
				// auth.api.getSession, which is not rate limited; the limiter's own
				// bookkeeping would cost more than the lookup it guards.
				"/get-session": false,
				"/sign-in/email": {
					window: RATE_LIMIT_WINDOW_S,
					max: SIGN_IN_RATE_LIMIT_MAX_REQUESTS,
				},
				"/sign-up/email": {
					window: RATE_LIMIT_WINDOW_S,
					max: SIGN_UP_RATE_LIMIT_MAX_REQUESTS,
				},
			},
		},
		advanced: {
			// SPA and API live on different origins, so cookies must be cross-site.
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
			// better-auth defaults to x-forwarded-for and drops multi-hop values,
			// which would collapse every client into one shared rate-limit bucket.
			// Cloudflare sets cf-connecting-ip itself and clients cannot spoof it.
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip"],
			},
		},
		plugins: [expo()],
	});
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Awaited<ReturnType<Auth["api"]["getSession"]>>;
