import { describe, expect, it } from "vitest";

import { HUANCAYO, LA_OROYA, LIMA, TICLIO } from "../hazards/test-fixtures";
import { routingBounds } from "./compare-routes";

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
