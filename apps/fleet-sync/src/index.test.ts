import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createDb: vi.fn(),
	syncConnection: vi.fn(),
	evaluateTrip: vi.fn(),
	pruneVehiclePositions: vi.fn(),
	resolveObsoleteAlerts: vi.fn(),
}));
vi.mock("./env.server", () => ({
	ENV: {
		FLEET_SYNC_RUN_SECRET: "run-secret",
		CREDENTIALS_ENCRYPTION_KEY: "encryption-key",
		OSRM_BASE_URL: "https://osrm.test",
		HYPERDRIVE: {},
	},
}));
vi.mock("@hack-the-andes-project/db", () => ({ createDb: mocks.createDb }));
vi.mock("@hack-the-andes-project/business", () => ({
	...mocks,
	isAlertableIncident: () => true,
}));
vi.mock("evlog/workers", () => ({ initWorkersLogger: vi.fn() }));
vi.mock("evlog", () => ({
	createLogger: () => ({ set: vi.fn(), setLevel: vi.fn(), emit: vi.fn() }),
}));

import worker from "./index";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("fleet-sync run endpoint", () => {
	it.each([undefined, "wrong-secret"])(
		"rejects an unauthorized run before opening the database (%s)",
		async (secret) => {
			const response = await worker.fetch(
				new Request("https://worker.test/run", {
					method: "POST",
					headers: secret ? { "x-fleet-sync-secret": secret } : {},
				}),
			);
			expect(response.status).toBe(401);
			expect(mocks.createDb).not.toHaveBeenCalled();
		},
	);

	it("does not accept a run secret in the URL or a GET request", async () => {
		const response = await worker.fetch(
			new Request("https://worker.test/run?x-fleet-sync-secret=run-secret"),
		);
		expect(response.status).toBe(404);
		expect(mocks.createDb).not.toHaveBeenCalled();
	});

	it("serializes provider work and trip evaluation and closes the database", async () => {
		const end = vi.fn();
		const query = {
			from: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			where: vi
				.fn()
				.mockResolvedValueOnce([{ id: "connection-1" }, { id: "connection-2" }])
				.mockResolvedValueOnce([
					{ trip: { id: "trip-1" }, vehicle: {} },
					{ trip: { id: "trip-2" }, vehicle: {} },
				])
				.mockResolvedValueOnce([]),
		};
		mocks.createDb.mockResolvedValue({ select: () => query, $client: { end } });
		let inFlight = 0;
		let maximumInFlight = 0;
		mocks.syncConnection.mockImplementation(async ({ connection }) => {
			inFlight += 1;
			maximumInFlight = Math.max(maximumInFlight, inFlight);
			await Promise.resolve();
			inFlight -= 1;
			return {
				connectionId: connection.id,
				ok: true,
				vehiclesSynced: 0,
				positionsInserted: 0,
			};
		});
		mocks.evaluateTrip.mockImplementation(async ({ trip }) => {
			inFlight += 1;
			maximumInFlight = Math.max(maximumInFlight, inFlight);
			await Promise.resolve();
			inFlight -= 1;
			return { tripId: trip.id, ok: true };
		});
		const response = await worker.fetch(
			new Request("https://worker.test/run", {
				method: "POST",
				headers: { "x-fleet-sync-secret": "run-secret" },
			}),
		);
		expect(response.status).toBe(200);
		expect(maximumInFlight).toBe(1);
		expect(mocks.syncConnection).toHaveBeenCalledTimes(2);
		expect(mocks.evaluateTrip).toHaveBeenCalledTimes(2);
		expect(mocks.pruneVehiclePositions).toHaveBeenCalledTimes(1);
		expect(end).toHaveBeenCalledTimes(1);
	});

	it("returns safe errors when database initialization fails", async () => {
		mocks.createDb.mockRejectedValue(
			new Error("database password private-password"),
		);
		const response = await worker.fetch(
			new Request("https://worker.test/run", {
				method: "POST",
				headers: { "x-fleet-sync-secret": "run-secret" },
			}),
		);
		expect(response.status).toBe(500);
		expect(await response.text()).not.toContain("private-password");
	});
});
