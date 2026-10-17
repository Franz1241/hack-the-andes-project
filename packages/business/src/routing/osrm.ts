import type { LineString } from "geojson";
import { z } from "zod";

import {
	MIN_ROUTE_COORDINATES_COUNT,
	ROUTING_REQUEST_TIMEOUT_MS,
	ROUTING_USER_AGENT,
} from "../constants";
import type { LatLng, RouteCandidate } from "../hazards/types";

const osrmResponseSchema = z.object({
	code: z.string(),
	message: z.string().optional(),
	routes: z
		.array(
			z.object({
				distance: z.number().nonnegative(),
				duration: z.number().nonnegative(),
				geometry: z.object({
					type: z.literal("LineString"),
					coordinates: z
						.array(z.tuple([z.number(), z.number()]))
						.min(MIN_ROUTE_COORDINATES_COUNT),
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
	// The public OSRM server answers 403 to requests without a User-Agent, and
	// the Workers fetch sends none by default.
	const response = await fetchImpl(url, {
		headers: { "User-Agent": ROUTING_USER_AGENT },
		signal: AbortSignal.timeout(ROUTING_REQUEST_TIMEOUT_MS),
	});
	if (!response.ok) {
		await response.body?.cancel();
		throw new Error(`OSRM route request failed with HTTP ${response.status}`);
	}
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
