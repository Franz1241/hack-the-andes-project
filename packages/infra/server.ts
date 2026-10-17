import "varlock/auto-load";

import { execSync } from "node:child_process";

import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";

import {
	SERVER_DEV_PORT,
	SERVER_WORKER_NAME,
	WORKER_OBSERVABILITY,
} from "./constants.ts";
import { hyperdriveRef } from "./hyperdrive.ts";

// Workers have no git context at runtime, so resolve the commit at deploy time
// and pass it as a plaintext var binding for evlog's build identity.
function resolveServiceVersion(): string {
	const fromEnv = process.env.SERVICE_VERSION;
	if (fromEnv) {
		return fromEnv;
	}
	try {
		return execSync("git rev-parse --short HEAD").toString().trim();
	} catch {
		return "unknown";
	}
}

export const serviceVersion = resolveServiceVersion();

export const server = Cloudflare.Worker("server", {
	name: SERVER_WORKER_NAME,
	main: "../../apps/server/src/index.ts",
	compatibility: {
		flags: ["nodejs_compat"],
	},
	observability: WORKER_OBSERVABILITY,
	env: {
		HYPERDRIVE: hyperdriveRef(),
		APP_ENV: Config.String("APP_ENV"),
		ALLOWED_ORIGINS: Config.String("ALLOWED_ORIGINS"),
		BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
		BETTER_AUTH_URL: Cloudflare.Worker.URL,
		SERVICE_VERSION: serviceVersion,
	},
	dev: {
		port: SERVER_DEV_PORT,
	},
});

export type ServerEnv = Cloudflare.InferEnv<typeof server>;
