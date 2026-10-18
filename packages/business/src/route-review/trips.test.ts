import { describe, expect, it } from "vitest";

import { MS_PER_HOUR } from "../constants";
import { isDepartureInReviewWindow, isUpcomingTrip } from "./trips";

const now = new Date("2026-10-17T18:00:00Z");
const hoursFromNow = (hours: number) =>
	new Date(now.getTime() + hours * MS_PER_HOUR);
const sixHoursS = 6 * 3_600;

describe("isUpcomingTrip", () => {
	it("keeps active trips and planned trips that have not arrived yet", () => {
		expect(
			isUpcomingTrip(
				{
					status: "active",
					departureAt: hoursFromNow(-30),
					chosenCandidate: { durationS: sixHoursS },
				},
				now,
			),
		).toBe(true);
		expect(
			isUpcomingTrip(
				{
					status: "planned",
					departureAt: hoursFromNow(-2),
					chosenCandidate: { durationS: sixHoursS },
				},
				now,
			),
		).toBe(true);
	});

	it("moves arrived, cancelled and completed trips to history", () => {
		expect(
			isUpcomingTrip(
				{
					status: "planned",
					departureAt: hoursFromNow(-7),
					chosenCandidate: { durationS: sixHoursS },
				},
				now,
			),
		).toBe(false);
		expect(
			isUpcomingTrip(
				{
					status: "cancelled",
					departureAt: hoursFromNow(3),
					chosenCandidate: { durationS: sixHoursS },
				},
				now,
			),
		).toBe(false);
	});
});

describe("isDepartureInReviewWindow", () => {
	it("accepts departures from now to 24 h ahead", () => {
		expect(isDepartureInReviewWindow(now, now)).toBe(true);
		expect(isDepartureInReviewWindow(hoursFromNow(24), now)).toBe(true);
	});

	it("rejects past departures and departures beyond 24 h", () => {
		expect(isDepartureInReviewWindow(hoursFromNow(-1), now)).toBe(false);
		expect(isDepartureInReviewWindow(hoursFromNow(25), now)).toBe(false);
	});
});
