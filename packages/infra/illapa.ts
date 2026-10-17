import "varlock/auto-load";

import * as Cloudflare from "alchemy/Cloudflare";

import {
	ILLAPA_DEV_PORT,
	ILLAPA_DOMAIN,
	ILLAPA_WORKER_NAME,
	WORKER_OBSERVABILITY,
} from "./constants.ts";

// Assets-only Worker: Astro prerenders every page, so no script runs at
// request time. PUBLIC_APP_URL is read by Astro itself from
// apps/illapa/.env.production during `astro build`, not through a binding.
export const illapa = Cloudflare.Website.StaticSite("illapa", {
	name: ILLAPA_WORKER_NAME,
	cwd: "../../apps/illapa",
	command: "pnpm build",
	outdir: "dist",
	domain: {
		name: ILLAPA_DOMAIN,
		redirects: [`www.${ILLAPA_DOMAIN}`],
	},
	assets: {
		htmlHandling: "auto-trailing-slash",
		notFoundHandling: "404-page",
	},
	observability: WORKER_OBSERVABILITY,
	dev: {
		command: "pnpm dev",
		url: `http://localhost:${ILLAPA_DEV_PORT}`,
	},
});
