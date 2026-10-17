import type { LineString } from "geojson";
import { z } from "zod";

import type { LatLng, RouteCandidate } from "../hazards/types";

const osrmResponseSchema = z.object({
	code: z.string(),
	message: z.string().optional(),
	routes: z
		.array(
			z.object({
				distance: z.number(),
				duration: z.number(),
				geometry: z.object({
					type: z.literal("LineString"),
					coordinates: z.array(z.array(z.number()).min(2)),
				}),
			}),
		)
		.default([]),
});

export interface FetchRouteCandidatesInput {
	baseUrl: string;
	origin: LatLng;
	destination: LatLng;
	fetchImpl?: typeof fetch;
}

export async function fetchRouteCandidates({
	baseUrl,
	origin,
	destination,
	fetchImpl = fetch,
}: FetchRouteCandidatesInput): Promise<RouteCandidate[]> {
	const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
	const url = `${baseUrl.replace(/\/$/, "")}/route/v1/driving/${coordinates}?alternatives=true&overview=full&geometries=geojson&steps=false`;
	const response = await fetchImpl(url);
	const body = osrmResponseSchema.parse(await response.json());
	if (body.code !== "Ok") {
		throw new Error(
			`OSRM route request failed with code ${body.code}${body.message ? `: ${body.message}` : ""} (${url})`,
		);
	}
	return body.routes.map((route) => {
		const geometry: LineString = {
			type: "LineString",
			coordinates: route.geometry.coordinates,
		};
		return {
			geometry,
			distanceM: route.distance,
			durationS: route.duration,
		};
	});
}
