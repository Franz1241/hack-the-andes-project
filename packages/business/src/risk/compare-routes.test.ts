import type { LineString } from "geojson";
import { describe, expect, it } from "vitest";

import { HUANCAYO, LA_OROYA, LIMA, TICLIO } from "../hazards/test-fixtures";
import { closedEdgeIds, routingBounds } from "./compare-routes";

function point([lng, lat]: [number, number]) {
	return { lat, lng };
}

describe("routingBounds", () => {
	it("keeps Ticlio and La Oroya when Lima and Huancayo share a latitude", () => {
		const bounds = routingBounds(point(LIMA), point(HUANCAYO));

		for (const [lng, lat] of [TICLIO, LA_OROYA]) {
			expect(lat).toBeLessThanOrEqual(bounds.north);
			expect(lat).toBeGreaterThanOrEqual(bounds.south);
			expect(lng).toBeGreaterThanOrEqual(bounds.west);
			expect(lng).toBeLessThanOrEqual(bounds.east);
		}
	});

	it("keeps the minimum margin around short trips", () => {
		const bounds = routingBounds(
			{ lat: -12, lng: -77 },
			{ lat: -12.01, lng: -77.01 },
		);

		expect(bounds.north).toBeCloseTo(-11.7);
		expect(bounds.west).toBeCloseTo(-77.31);
	});
});

describe("closedEdgeIds", () => {
	// Two parallel streets ~110 m apart, both within the closure radius.
	const carreteraCentral: LineString = {
		type: "LineString",
		coordinates: [
			[-76.39, -11.844],
			[-76.38, -11.844],
		],
	};
	const parallelStreet: LineString = {
		type: "LineString",
		coordinates: [
			[-76.39, -11.845],
			[-76.38, -11.845],
		],
	};
	const closure = {
		id: "closure",
		title: "Huaico en Matucana",
		roadCode: "PE-22",
		lat: -11.844,
		lng: -76.385,
	};

	it("blocks the closed road but not a nearby road with another code", () => {
		expect(
			closedEdgeIds(
				[
					{ id: "pe22", roadCode: "PE-22", geometry: carreteraCentral },
					{ id: "local", roadCode: "LM-115", geometry: parallelStreet },
				],
				[closure],
			),
		).toEqual(new Set(["pe22"]));
	});

	it("blocks uncoded edges near a coded closure", () => {
		expect(
			closedEdgeIds(
				[{ id: "untagged", roadCode: null, geometry: carreteraCentral }],
				[closure],
			),
		).toEqual(new Set(["untagged"]));
	});

	it("blocks every nearby edge when the closure has no road code", () => {
		expect(
			closedEdgeIds(
				[
					{ id: "pe22", roadCode: "PE-22", geometry: carreteraCentral },
					{ id: "local", roadCode: "LM-115", geometry: parallelStreet },
				],
				[{ ...closure, roadCode: null }],
			),
		).toEqual(new Set(["pe22", "local"]));
	});

	it("ignores edges beyond the closure radius", () => {
		expect(
			closedEdgeIds(
				[{ id: "pe22", roadCode: "PE-22", geometry: carreteraCentral }],
				[{ ...closure, lat: -11.86 }],
			),
		).toEqual(new Set());
	});
});
