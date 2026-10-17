import type { Database } from "@hack-the-andes-project/db";
import { alert, trip } from "@hack-the-andes-project/db/schema/fleet";
import { incident } from "@hack-the-andes-project/db/schema/scraper";
import { and, eq, inArray, notExists, or } from "drizzle-orm";

export interface ResolveObsoleteAlertsInput {
	db: Database;
	now: Date;
	organizationId?: string;
}

export async function resolveObsoleteAlerts({
	db,
	now,
	organizationId,
}: ResolveObsoleteAlertsInput) {
	const [resolved] = await db
		.update(alert)
		.set({ status: "resolved", resolvedAt: now })
		.where(
			and(
				organizationId ? eq(alert.organizationId, organizationId) : undefined,
				inArray(alert.status, ["open", "acknowledged"]),
				or(
					notExists(
						db
							.select({ id: trip.id })
							.from(trip)
							.where(
								and(
									eq(trip.id, alert.tripId),
									eq(trip.organizationId, alert.organizationId),
									eq(trip.status, "active"),
								),
							),
					),
					notExists(
						db
							.select({ id: incident.id })
							.from(incident)
							.where(
								and(
									eq(incident.id, alert.incidentId),
									eq(incident.active, true),
								),
							),
					),
				),
			),
		);
	return resolved.affectedRows;
}
