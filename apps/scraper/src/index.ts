import { createDb } from "@hack-the-andes-project/db";
import {
	SCRAPER_DAILY_CRON,
	SCRAPER_FREQUENT_CRON,
	SCRAPER_HOURLY_CRON,
} from "@hack-the-andes-project/infra/constants";
import { createLogger } from "evlog";
import { initWorkersLogger } from "evlog/workers";

import { RUN_SECRET_HEADER, SELF_RUN_ORIGIN, SERVICE_NAME } from "./constants";
import { ENV } from "./env.server";
import { createMediaBucket } from "./lib/media-bucket";
import { findSource, sourcesForSchedule } from "./sources";
import { SCHEDULES, type Schedule, type ScrapeSource } from "./sources/types";
import { runSource, type SourceRunResult } from "./sync";

initWorkersLogger({
	env: {
		service: SERVICE_NAME,
		environment: ENV.APP_ENV,
		version: ENV.SERVICE_VERSION,
	},
});

interface RunSummary {
	ok: boolean;
	results: SourceRunResult[];
}

async function runSingleSource(
	trigger: string,
	source: ScrapeSource,
): Promise<RunSummary> {
	const log = createLogger({ job: "scrape", trigger, source: source.id });
	const db = await createDb(ENV.HYPERDRIVE);
	const result = await runSource(db, source, log, {
		jevApiKey: ENV.JEV_API_KEY,
		mediaBucket: createMediaBucket({
			keyId: ENV.B2_MEDIA_KEY_ID,
			applicationKey: ENV.B2_MEDIA_APPLICATION_KEY,
		}),
	});
	log.set({ run: result });
	if (!result.ok) {
		log.setLevel("error");
	}
	log.emit();
	return { ok: result.ok, results: [result] };
}

// Each source runs in its own invocation through the self service binding so
// a large feed (SERFOR ~1k rows, health facilities ~9k rows) gets a full CPU
// budget instead of starving the sources queued behind it.
async function fanOut(
	trigger: string,
	sources: ScrapeSource[],
): Promise<RunSummary> {
	const log = createLogger({ job: "scrape", trigger, fanOut: sources.length });
	const settled = await Promise.allSettled(
		sources.map(async (source) => {
			const response = await ENV.SELF.fetch(
				`${SELF_RUN_ORIGIN}/run?source=${encodeURIComponent(source.id)}`,
				{
					method: "POST",
					headers: { [RUN_SECRET_HEADER]: ENV.SCRAPER_RUN_SECRET },
				},
			);
			const summary: RunSummary = await response.json();
			return summary.results;
		}),
	);
	const results = settled.flatMap((outcome, index) =>
		outcome.status === "fulfilled"
			? outcome.value
			: [
					{
						source: sources[index]?.id ?? "unknown",
						ok: false,
						fetched: 0,
						inserted: 0,
						updated: 0,
						deactivated: 0,
						durationMs: 0,
						error: String(outcome.reason),
					},
				],
	);
	const ok = results.every((result) => result.ok);
	log.set({ sources: results });
	if (!ok) {
		log.setLevel("error");
	}
	log.emit();
	return { ok, results };
}

const SCHEDULE_BY_CRON: Record<string, Schedule> = {
	[SCRAPER_FREQUENT_CRON]: "frequent",
	[SCRAPER_HOURLY_CRON]: "hourly",
	[SCRAPER_DAILY_CRON]: "daily",
};

function isSchedule(value: string | null): value is Schedule {
	return SCHEDULES.some((schedule) => schedule === value);
}

export default {
	async scheduled(
		controller: ScheduledController,
		_env: Env,
		ctx: ExecutionContext,
	) {
		const schedule = SCHEDULE_BY_CRON[controller.cron];
		if (!schedule) {
			throw new Error(`No schedule registered for cron "${controller.cron}"`);
		}
		ctx.waitUntil(
			fanOut(`cron:${controller.cron}`, sourcesForSchedule(schedule)),
		);
	},

	// Manual trigger for local runs and backfills:
	//   POST /run?schedule=frequent  (fans out)  or  POST /run?source=sutran_alerts
	// guarded by the shared SCRAPER_RUN_SECRET header.
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return new Response("OK");
		}
		if (url.pathname !== "/run" || request.method !== "POST") {
			return Response.json({ error: "not_found" }, { status: 404 });
		}
		if (request.headers.get(RUN_SECRET_HEADER) !== ENV.SCRAPER_RUN_SECRET) {
			return Response.json({ error: "unauthorized" }, { status: 401 });
		}
		const sourceId = url.searchParams.get("source");
		const schedule = url.searchParams.get("schedule");
		let summary: RunSummary;
		if (sourceId) {
			const source = findSource(sourceId);
			if (!source) {
				return Response.json(
					{ error: "unknown_source", source: sourceId },
					{ status: 400 },
				);
			}
			summary = await runSingleSource("manual", source);
		} else if (isSchedule(schedule)) {
			summary = await fanOut("manual", sourcesForSchedule(schedule));
		} else {
			return Response.json(
				{
					error: "bad_request",
					message: "Pass ?source=<id> or ?schedule=frequent|hourly|daily",
				},
				{ status: 400 },
			);
		}
		return Response.json(summary, { status: summary.ok ? 200 : 500 });
	},
};
