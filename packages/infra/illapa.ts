import "varlock/auto-load";

import * as Cloudflare from "alchemy/Cloudflare";

import {
	ILLAPA_DEMO_REQUESTS_KV_TITLE,
	ILLAPA_DOMAIN,
	ILLAPA_WORKER_NAME,
	WORKER_OBSERVABILITY,
} from "./constants.ts";

// Astro prerenders every page; the Worker in front of the assets only answers
// the demo-request POST and hands everything else to the asset layer.
// PUBLIC_APP_URL is read by Astro itself from apps/illapa/.env.production
// during `astro build`, not through a binding.
export const illapa = Cloudflare.Website.StaticSite("illapa", {
	name: ILLAPA_WORKER_NAME,
	cwd: "../../apps/illapa",
	command: "pnpm build",
	memo: {
		include: [
			"**/*",
			"../../packages/ui/src/**",
			"../../packages/business/src/**",
		],
		lockfile: true,
	},
	outdir: "dist",
	main: "../../apps/illapa/src/worker.ts",
	domain: {
		name: ILLAPA_DOMAIN,
		redirects: [`www.${ILLAPA_DOMAIN}`],
	},
	assets: {
		htmlHandling: "auto-trailing-slash",
		notFoundHandling: "404-page",
		runWorkerFirst: ["/api/*"],
	},
	observability: WORKER_OBSERVABILITY,
	env: {
		DEMO_REQUESTS: Cloudflare.KV.Namespace("demo-requests", {
			title: ILLAPA_DEMO_REQUESTS_KV_TITLE,
		}),
	},
});

export interface IllapaEnv extends Cloudflare.InferEnv<typeof illapa> {}
