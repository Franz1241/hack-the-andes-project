import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

import { illapa } from "./illapa.ts";
import { server } from "./server.ts";
import { web } from "./web.ts";

export { type ServerEnv, server } from "./server.ts";

export default Alchemy.Stack(
	"hack-the-andes-project",
	{
		providers: Cloudflare.providers(),
		state: Alchemy.localState(),
	},
	Effect.gen(function* () {
		const [serverWorker, webWorker, illapaWorker] = yield* Effect.all(
			[server, web, illapa],
			{
				concurrency: "unbounded",
			},
		);

		return {
			server: serverWorker.url,
			web: webWorker.url,
			illapa: illapaWorker.url,
		};
	}),
);
