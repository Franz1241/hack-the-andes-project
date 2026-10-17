import type { Position } from "geojson";
import { describe, expect, it, vi } from "vitest";

import { DEMO_TRIP_MAX_ATTEMPTS_COUNT } from "../constants";
import {
	CARRETERA_CENTRAL,
	LIMA,
	LIMA_HUANCAYO_ROUTE,
	MATUCANA,
	pointIncident,
	SAN_MATEO,
} from "../hazards/test-fixtures";
import { planDemoTrip } from "./plan-demo-trip";

const origin = { lat: LIMA[1], lng: LIMA[0] };
const PANAMERICANA_SUR: Position[] = [LIMA, [-76.87, -12.27], [-76.75, -12.45]];
const PANAMERICANA_SUR_DISTANCE_M = 48_000;

function osrmRoute(coordinates: Position[], distanceM: number) {
	return Response.json({
		code: "Ok",
		routes: [
			{
				distance: distanceM,
				duration: distanceM / 15,
				geometry: { type: "LineString", coordinates },
			},
		],
	});
}

function requestedDestination(fetchImpl: ReturnType<typeof vi.fn>) {
	const [, destinationLngLat] =
		String(fetchImpl.mock.calls[0]?.[0])
			.split("/driving/")[1]
			?.split("?")[0]
			?.split(";") ?? [];
	const [lng, lat] = (destinationLngLat ?? "").split(",").map(Number);
	return { lat, lng };
}

describe("planDemoTrip", () => {
	it("aims past the nearest incident in range so the route runs through it", async () => {
		const fetchImpl = vi.fn<typeof fetch>(async () =>
			osrmRoute(CARRETERA_CENTRAL.coordinates, LIMA_HUANCAYO_ROUTE.distanceM),
		);
		const plan = await planDemoTrip({
			osrmBaseUrl: "https://osrm.test",
			origin,
			scenario: "hazard",
			incidents: [
				pointIncident("next-door", [-76.89, -12.06]),
				pointIncident("arequipa", [-71.54, -16.41]),
				{ ...pointIncident("unlocated", MATUCANA), lat: null, lng: null },
				pointIncident("matucana", MATUCANA),
			],
			fetchImpl,
		});
		expect(plan?.incident?.id).toBe("matucana");
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		const destination = requestedDestination(fetchImpl);
		expect(destination.lng).toBeGreaterThan(MATUCANA[0]);
		expect(destination.lat).toBeGreaterThan(MATUCANA[1]);
		expect(plan?.destination).toEqual(destination);
	});

	it("moves on to the next incident when the road route misses the first", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				osrmRoute(PANAMERICANA_SUR, PANAMERICANA_SUR_DISTANCE_M),
			)
			.mockResolvedValueOnce(
				osrmRoute(CARRETERA_CENTRAL.coordinates, LIMA_HUANCAYO_ROUTE.distanceM),
			);
		const plan = await planDemoTrip({
			osrmBaseUrl: "https://osrm.test",
			origin,
			scenario: "hazard",
			incidents: [
				pointIncident("san-mateo", SAN_MATEO),
				pointIncident("matucana", MATUCANA),
			],
			fetchImpl,
		});
		expect(plan?.incident?.id).toBe("san-mateo");
		expect(fetchImpl).toHaveBeenCalledTimes(2);
	});

	it("heads away from incidents first and accepts a route that avoids all of them", async () => {
		const fetchImpl = vi.fn<typeof fetch>(async () =>
			osrmRoute(PANAMERICANA_SUR, PANAMERICANA_SUR_DISTANCE_M),
		);
		const plan = await planDemoTrip({
			osrmBaseUrl: "https://osrm.test",
			origin,
			scenario: "clear",
			incidents: [pointIncident("matucana", MATUCANA)],
			fetchImpl,
		});
		expect(plan?.incident).toBeNull();
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		const destination = requestedDestination(fetchImpl);
		expect(destination.lat).toBeLessThan(origin.lat);
		expect(destination.lng).toBeLessThan(origin.lng);
	});

	it("gives up after a few routes that cross an incident or stay too short", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValueOnce(
				osrmRoute(
					PANAMERICANA_SUR.slice(0, 2),
					PANAMERICANA_SUR_DISTANCE_M / 4,
				),
			)
			.mockImplementation(async () =>
				osrmRoute(CARRETERA_CENTRAL.coordinates, LIMA_HUANCAYO_ROUTE.distanceM),
			);
		await expect(
			planDemoTrip({
				osrmBaseUrl: "https://osrm.test",
				origin,
				scenario: "clear",
				incidents: [pointIncident("matucana", MATUCANA)],
				fetchImpl,
			}),
		).resolves.toBeNull();
		expect(fetchImpl).toHaveBeenCalledTimes(DEMO_TRIP_MAX_ATTEMPTS_COUNT);
	});
});
