import type { incident, poi } from "@hack-the-andes-project/db/schema/scraper";
import type { InferInsertModel } from "drizzle-orm";

export const SCHEDULES = ["frequent", "daily"] as const;
export type Schedule = (typeof SCHEDULES)[number];

type ManagedColumns =
	| "id"
	| "source"
	| "contentHash"
	| "active"
	| "firstSeenAt"
	| "lastSeenAt"
	| "lastChangedAt";

export type IncidentRecord = Omit<
	InferInsertModel<typeof incident>,
	ManagedColumns
>;
export type PoiRecord = Omit<InferInsertModel<typeof poi>, ManagedColumns>;

export interface ScrapeContext {
	now: Date;
}

// A source is anything that can produce a full snapshot of what it currently
// knows: a public JSON API, a scraped HTML page, an ArcGIS layer or an Apify
// dataset. Returning the full snapshot (not a delta) is what lets the sync
// layer insert, update and deactivate rows without the source tracking state.
export interface IncidentSource {
	kind: "incident";
	id: string;
	schedule: Schedule;
	fetch(context: ScrapeContext): Promise<IncidentRecord[]>;
}

export interface PoiSource {
	kind: "poi";
	id: string;
	schedule: Schedule;
	fetch(context: ScrapeContext): Promise<PoiRecord[]>;
}

export type ScrapeSource = IncidentSource | PoiSource;
