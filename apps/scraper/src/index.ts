import { createDb } from "@hack-the-andes-project/db";
import { SCRAPER_DAILY_CRON } from "@hack-the-andes-project/infra/constants";
import { createLogger } from "evlog";
import { initWorkersLogger } from "evlog/workers";

import { SERVICE_NAME } from "./constants";
import { ENV } from "./env.server";
import { findSource, sourcesForSchedule } from "./sources";
import { SCHEDULES, type Schedule, type ScrapeSource } from "./sources/types";
import { runSource } from "./sync";

initWorkersLogger({
	env: {
		service: SERVICE_NAME,
		environment: ENV.APP_ENV,
		version: ENV.SERVICE_VERSION,
	},
});

interface RunSummary {
	ok: boolean;
	results: Awaited<ReturnType<typeof runSource>>[];
}

// One wide event per invocation with a `sources` array entry per feed. Feeds
// are fetched concurrently (they are independent HTTP calls) but written one
// after another: mysql2 shares a single connection per invocation.
async function runSources(
	trigger: string,
	sources: ScrapeSource[],
): Promise<RunSummary> {
	const log = createLogger({ job: "scrape", trigger });
	const now = new Date();
	const db = await createDb(ENV.HYPERDRIVE);
	const results: RunSummary["results"] = [];
	for (const source of sources) {
		const result = await runSource(db, source, now);
		results.push(result);
		log.set({ sources: [result] });
	}
	const ok = results.every((result) => result.ok);
	if (!ok) {
		log.setLevel("error");
	}
	log.emit();
	return { ok, results };
}

function isSchedule(value: string | null): value is Schedule {
	return SCHEDULES.some((schedule) => schedule === value);
}

export default {
	async scheduled(
		controller: ScheduledController,
		_env: Env,
		ctx: ExecutionContext,
	) {
		const schedule: Schedule =
			controller.cron === SCRAPER_DAILY_CRON ? "daily" : "frequent";
		ctx.waitUntil(
			runSources(`cron:${controller.cron}`, sourcesForSchedule(schedule)),
		);
	},

	// Manual trigger for local runs and backfills:
	//   POST /run?schedule=frequent  or  POST /run?source=sutran_alerts
	// guarded by the shared SCRAPER_RUN_SECRET header.
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return new Response("OK");
		}
		if (url.pathname !== "/run" || request.method !== "POST") {
			return Response.json({ error: "not_found" }, { status: 404 });
		}
		if (request.headers.get("x-scraper-secret") !== ENV.SCRAPER_RUN_SECRET) {
			return Response.json({ error: "unauthorized" }, { status: 401 });
		}
		const sourceId = url.searchParams.get("source");
		const schedule = url.searchParams.get("schedule");
		let sources: ScrapeSource[];
		if (sourceId) {
			const source = findSource(sourceId);
			if (!source) {
				return Response.json(
					{ error: "unknown_source", source: sourceId },
					{ status: 400 },
				);
			}
			sources = [source];
		} else if (isSchedule(schedule)) {
			sources = sourcesForSchedule(schedule);
		} else {
			return Response.json(
				{
					error: "bad_request",
					message: "Pass ?source=<id> or ?schedule=frequent|daily",
				},
				{ status: 400 },
			);
		}
		const summary = await runSources("manual", sources);
		return Response.json(summary, { status: summary.ok ? 200 : 500 });
	},
};
