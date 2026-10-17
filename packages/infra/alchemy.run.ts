import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

import { illapa } from "./illapa.ts";
import { scraper } from "./scraper.ts";
import { server } from "./server.ts";
import { web } from "./web.ts";

export { type ScraperEnv, scraper } from "./scraper.ts";
export { type ServerEnv, server } from "./server.ts";

export default Alchemy.Stack(
	"hack-the-andes-project",
	{
		providers: Cloudflare.providers(),
		state: Alchemy.localState(),
	},
	Effect.gen(function* () {
		const [serverWorker, webWorker, illapaWorker, scraperWorker] =
			yield* Effect.all([server, web, illapa, scraper], {
				concurrency: "unbounded",
			});

		return {
			server: serverWorker.url,
			web: webWorker.url,
			illapa: illapaWorker.url,
			scraper: scraperWorker.url,
		};
	}),
);
