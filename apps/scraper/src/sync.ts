import type { Database } from "@hack-the-andes-project/db";
import {
	incident,
	poi,
	scrapeRun,
} from "@hack-the-andes-project/db/schema/scraper";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";

import { DB_WRITE_CHUNK_SIZE, MAX_RUN_ERROR_MESSAGE_CHARS } from "./constants";
import { contentHash } from "./lib/hash";
import type { ScrapeSource } from "./sources/types";

interface SyncedTable extends MySqlTable {
	id: MySqlColumn;
	source: MySqlColumn;
	sourceId: MySqlColumn;
	contentHash: MySqlColumn;
	active: MySqlColumn;
	lastSeenAt: MySqlColumn;
	lastChangedAt: MySqlColumn;
}

export interface ExistingRow {
	id: string;
	sourceId: string;
	contentHash: string;
	active: boolean;
}

interface HashedRecord<TRecord> {
	record: TRecord;
	contentHash: string;
}

export interface SyncPlan<TRecord> {
	inserts: HashedRecord<TRecord>[];
	updates: (HashedRecord<TRecord> & { id: string })[];
	unchangedIds: string[];
}

// Pure diff between what the source reported and what the table holds. Later
// duplicates of a sourceId win, an inactive row with identical content still
// counts as an update so it gets reactivated with a fresh lastChangedAt.
export async function planSync<TRecord extends { sourceId: string }>(
	existing: ExistingRow[],
	records: TRecord[],
): Promise<SyncPlan<TRecord>> {
	const existingBySourceId = new Map(
		existing.map((row) => [row.sourceId, row]),
	);
	const latestBySourceId = new Map(
		records.map((record) => [record.sourceId, record]),
	);
	const plan: SyncPlan<TRecord> = {
		inserts: [],
		updates: [],
		unchangedIds: [],
	};
	for (const record of latestBySourceId.values()) {
		const hash = await contentHash(record);
		const current = existingBySourceId.get(record.sourceId);
		if (!current) {
			plan.inserts.push({ record, contentHash: hash });
		} else if (current.contentHash === hash && current.active) {
			plan.unchangedIds.push(current.id);
		} else {
			plan.updates.push({ id: current.id, record, contentHash: hash });
		}
	}
	return plan;
}

function chunked<T>(items: T[]): T[][] {
	const chunks: T[][] = [];
	for (let start = 0; start < items.length; start += DB_WRITE_CHUNK_SIZE) {
		chunks.push(items.slice(start, start + DB_WRITE_CHUNK_SIZE));
	}
	return chunks;
}

interface SyncCounts {
	inserted: number;
	updated: number;
	deactivated: number;
}

async function syncTable<TRecord extends { sourceId: string }>(
	db: Database,
	table: SyncedTable,
	source: string,
	records: TRecord[],
	runStartedAt: Date,
): Promise<SyncCounts> {
	const existingRows = await db
		.select({
			id: sql<string>`${table.id}`,
			sourceId: sql<string>`${table.sourceId}`,
			contentHash: sql<string>`${table.contentHash}`,
			active: sql<number>`${table.active}`,
		})
		.from(table)
		.where(eq(table.source, source));
	const plan = await planSync(
		existingRows.map((row) => ({ ...row, active: Boolean(row.active) })),
		records,
	);

	for (const chunk of chunked(plan.inserts)) {
		await db.insert(table).values(
			chunk.map(({ record, contentHash: hash }) => ({
				...record,
				id: crypto.randomUUID(),
				source,
				contentHash: hash,
				active: true,
				firstSeenAt: runStartedAt,
				lastSeenAt: runStartedAt,
				lastChangedAt: runStartedAt,
			})),
		);
	}
	for (const { id, record, contentHash: hash } of plan.updates) {
		await db
			.update(table)
			.set({
				...record,
				contentHash: hash,
				active: true,
				lastSeenAt: runStartedAt,
				lastChangedAt: runStartedAt,
			})
			.where(eq(table.id, id));
	}
	for (const chunk of chunked(plan.unchangedIds)) {
		await db
			.update(table)
			.set({ lastSeenAt: runStartedAt })
			.where(inArray(table.id, chunk));
	}
	const [deactivation] = await db
		.update(table)
		.set({ active: false, lastChangedAt: runStartedAt })
		.where(
			and(
				eq(table.source, source),
				eq(table.active, true),
				lt(table.lastSeenAt, runStartedAt),
			),
		);
	return {
		inserted: plan.inserts.length,
		updated: plan.updates.length,
		deactivated: deactivation.affectedRows,
	};
}

export interface SourceRunResult extends SyncCounts {
	source: string;
	ok: boolean;
	fetched: number;
	durationMs: number;
	error?: string;
}

// Every timestamp written by a run is `runStartedAt`, so the deactivation
// sweep (`lastSeenAt < runStartedAt`) can never catch rows this run touched.
export async function runSource(
	db: Database,
	source: ScrapeSource,
): Promise<SourceRunResult> {
	const runStartedAt = new Date();
	let result: SourceRunResult = {
		source: source.id,
		ok: false,
		fetched: 0,
		inserted: 0,
		updated: 0,
		deactivated: 0,
		durationMs: 0,
	};
	try {
		if (source.kind === "incident") {
			const records = await source.fetch({ now: runStartedAt });
			const counts = await syncTable(
				db,
				incident,
				source.id,
				records,
				runStartedAt,
			);
			result = { ...result, ...counts, ok: true, fetched: records.length };
		} else {
			const records = await source.fetch({ now: runStartedAt });
			const counts = await syncTable(db, poi, source.id, records, runStartedAt);
			result = { ...result, ...counts, ok: true, fetched: records.length };
		}
	} catch (error) {
		result.error = (
			error instanceof Error ? error.message : String(error)
		).slice(0, MAX_RUN_ERROR_MESSAGE_CHARS);
	}
	const finishedAt = new Date();
	result.durationMs = finishedAt.getTime() - runStartedAt.getTime();
	await db.insert(scrapeRun).values({
		id: crypto.randomUUID(),
		source: source.id,
		startedAt: runStartedAt,
		finishedAt,
		ok: result.ok,
		fetched: result.fetched,
		inserted: result.inserted,
		updated: result.updated,
		deactivated: result.deactivated,
		errorMessage: result.error ?? null,
	});
	return result;
}
