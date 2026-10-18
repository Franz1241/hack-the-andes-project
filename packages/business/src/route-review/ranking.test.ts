import { describe, expect, it } from "vitest";

import { compareRouteCandidates, peakRiskAssessment } from "./ranking";

function candidate(
	name: string,
	eligible: boolean,
	scores: number[],
	durationS: number,
) {
	return {
		name,
		eligibility: { eligible },
		risk: scores.map((score) => ({ score })),
		durationS,
	};
}

describe("peakRiskAssessment", () => {
	it("returns the assessment with the highest score", () => {
		expect(
			peakRiskAssessment([
				{ horizon: "now", score: 40 },
				{ horizon: "24h", score: 72 },
			]),
		).toEqual({ horizon: "24h", score: 72 });
	});

	it("returns undefined without assessments", () => {
		expect(peakRiskAssessment([])).toBeUndefined();
	});
});

describe("compareRouteCandidates", () => {
	it("puts eligible candidates first, then lower peak risk, then shorter duration", () => {
		const ordered = [
			candidate("ineligible-safe", false, [10, 12], 100),
			candidate("risky", true, [40, 72], 100),
			candidate("safe-slow", true, [30, 44], 900),
			candidate("safe-fast", true, [44, 20], 300),
		]
			.toSorted(compareRouteCandidates)
			.map(({ name }) => name);

		expect(ordered).toEqual([
			"safe-fast",
			"safe-slow",
			"risky",
			"ineligible-safe",
		]);
	});
});
