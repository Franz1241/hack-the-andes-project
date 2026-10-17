import { RPP_FETCH_CONCURRENCY, RPP_LATEST_NEWS_URL } from "../constants";
import { mapWithConcurrency } from "../lib/concurrency";
import { parseIsoDate } from "../lib/dates";
import { decodeHtmlEntities, stripHtml } from "../lib/html";
import { fetchText } from "../lib/http";
import { classifyNews } from "../lib/jev";
import type {
	IncidentRecord,
	NewsRecord,
	NewsSource,
	ScrapeContext,
} from "./types";

const ARTICLE_PATTERN = /<article[^>]*>([\s\S]*?)<\/article>/g;
const TITLE_PATTERN =
	/class="news__title"[^>]*>\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/;
const TAG_PATTERN = /class="news__tag"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/;
const AUTHOR_PATTERN =
	/class="news__author"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/;
const DATE_PATTERN = /class="news__date[^"]*"[^>]*data-x="([^"]+)"/;
const ARTICLE_ID_PATTERN = /-noticia-(\d+)\/?$/;
const META_DESCRIPTION_PATTERN =
	/<meta[^>]+(?:name|property)="(?:og:)?description"[^>]*content="([^"]*)"/;

export interface RppListingEntry {
	sourceId: string;
	url: string;
	title: string;
	section: string | null;
	author: string | null;
	publishedAt: Date | null;
}

export function parseRppListing(html: string): RppListingEntry[] {
	const entries: RppListingEntry[] = [];
	for (const [, article] of html.matchAll(ARTICLE_PATTERN)) {
		const titleMatch = article?.match(TITLE_PATTERN);
		if (!article || !titleMatch?.[1] || !titleMatch[2]) {
			continue;
		}
		const url = titleMatch[1];
		entries.push({
			sourceId: url.match(ARTICLE_ID_PATTERN)?.[1] ?? url,
			url,
			title: stripHtml(titleMatch[2]),
			section: article.match(TAG_PATTERN)?.[1]
				? stripHtml(article.match(TAG_PATTERN)?.[1] ?? "")
				: null,
			author: article.match(AUTHOR_PATTERN)?.[1]
				? stripHtml(article.match(AUTHOR_PATTERN)?.[1] ?? "")
				: null,
			publishedAt: parseIsoDate(article.match(DATE_PATTERN)?.[1]),
		});
	}
	return entries;
}

export function extractExcerpt(articleHtml: string): string | null {
	const description = articleHtml.match(META_DESCRIPTION_PATTERN)?.[1];
	if (!description) {
		return null;
	}
	const excerpt = decodeHtmlEntities(description).trim();
	return excerpt.length > 0 ? excerpt : null;
}

// Only articles not yet stored are expanded (one page fetch for the excerpt,
// one Jev call for the classification); a failure on either side drops the
// article from this run so it is retried on the next listing.
async function expandEntry(
	entry: RppListingEntry,
	context: ScrapeContext,
): Promise<NewsRecord | null> {
	let excerpt: string | null = null;
	try {
		excerpt = extractExcerpt(await fetchText(entry.url));
	} catch (error) {
		context.log.set({
			rpp: { excerptFailures: [{ url: entry.url, error: String(error) }] },
		});
	}
	try {
		const classification = await classifyNews(context.jevApiKey, {
			title: entry.title,
			excerpt,
			section: entry.section,
			publishedAt: entry.publishedAt,
		});
		return {
			sourceId: entry.sourceId,
			url: entry.url,
			title: entry.title,
			excerpt,
			section: entry.section,
			author: entry.author,
			publishedAt: entry.publishedAt,
			relevant: classification.relevant,
			relevance: classification.relevance,
			category: classification.category,
			severity: classification.severity,
			region: classification.region,
			classification: {
				status: classification.status,
				answers: classification.answers,
				confidence: classification.confidence,
				model: classification.model,
			},
		};
	} catch (error) {
		context.log.set({
			rpp: {
				classificationFailures: [{ url: entry.url, error: String(error) }],
			},
		});
		return null;
	}
}

export const rppNewsSource: NewsSource = {
	kind: "news",
	id: "rpp_latest_news",
	schedule: "frequent",
	snapshot: "partial",
	async fetch(context) {
		const listing = parseRppListing(await fetchText(RPP_LATEST_NEWS_URL));
		const fresh = listing.filter(
			(entry) => !context.knownSourceIds.has(entry.sourceId),
		);
		context.log.set({
			rpp: { listed: listing.length, fresh: fresh.length },
		});
		const expanded = await mapWithConcurrency(
			fresh,
			RPP_FETCH_CONCURRENCY,
			(entry) => expandEntry(entry, context),
		);
		return expanded.flatMap((record) => record ?? []);
	},
	toIncident(record): IncidentRecord | null {
		if (!record.relevant || !record.category || !record.severity) {
			return null;
		}
		const classification = record.classification;
		return {
			sourceId: record.sourceId,
			category: record.category,
			severity: record.severity,
			title: record.title,
			description: record.excerpt ?? null,
			status:
				typeof classification.status === "string"
					? classification.status
					: null,
			roadStatus: null,
			roadCode: null,
			roadName: null,
			roadKm: null,
			lat: null,
			lng: null,
			geometry: null,
			region: record.region ?? null,
			provincia: null,
			distrito: null,
			occurredAt: record.publishedAt ?? null,
			sourceUpdatedAt: null,
			validFrom: null,
			validUntil: null,
			attributes: {
				url: record.url,
				section: record.section,
				relevance: record.relevance,
				classification,
			},
		};
	},
};
