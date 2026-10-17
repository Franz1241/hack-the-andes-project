import { describe, expect, it, vi } from "vitest";

import { fetchRouteCandidates } from "./osrm";

const origin = { lat: -12.05, lng: -76.88 };
const destination = { lat: -12.07, lng: -75.21 };

function fetchReturning(body: unknown): typeof fetch {
	return vi.fn(async () => new Response(JSON.stringify(body)));
}

describe("fetchRouteCandidates", () => {
	it("requests alternatives and maps every route to a candidate", async () => {
		const fetchImpl = fetchReturning({
			code: "Ok",
			routes: [
				{
					distance: 300_000,
					duration: 25_200,
					geometry: {
						type: "LineString",
						coordinates: [
							[-76.88, -12.05],
							[-75.21, -12.07],
						],
					},
				},
				{
					distance: 330_000,
					duration: 28_800,
					geometry: {
						type: "LineString",
						coordinates: [
							[-76.88, -12.05],
							[-76, -11.5],
							[-75.21, -12.07],
						],
					},
				},
			],
		});
		const candidates = await fetchRouteCandidates({
			baseUrl: "https://router.example/",
			origin,
			destination,
			fetchImpl,
		});
		expect(fetchImpl).toHaveBeenCalledWith(
			"https://router.example/route/v1/driving/-76.88,-12.05;-75.21,-12.07?alternatives=true&overview=full&geometries=geojson&steps=false",
		);
		expect(candidates).toEqual([
			{
				geometry: {
					type: "LineString",
					coordinates: [
						[-76.88, -12.05],
						[-75.21, -12.07],
					],
				},
				distanceM: 300_000,
				durationS: 25_200,
			},
			{
				geometry: {
					type: "LineString",
					coordinates: [
						[-76.88, -12.05],
						[-76, -11.5],
						[-75.21, -12.07],
					],
				},
				distanceM: 330_000,
				durationS: 28_800,
			},
		]);
	});

	it("throws a descriptive error when OSRM does not return Ok", async () => {
		const fetchImpl = fetchReturning({
			code: "NoRoute",
			message: "Impossible route.",
		});
		await expect(
			fetchRouteCandidates({
				baseUrl: "https://router.example",
				origin,
				destination,
				fetchImpl,
			}),
		).rejects.toThrow(
			"OSRM route request failed with code NoRoute: Impossible route.",
		);
	});

	it("rejects malformed responses", async () => {
		const fetchImpl = fetchReturning({
			code: "Ok",
			routes: [{ distance: "far" }],
		});
		await expect(
			fetchRouteCandidates({
				baseUrl: "https://router.example",
				origin,
				destination,
				fetchImpl,
			}),
		).rejects.toThrow();
	});
});
