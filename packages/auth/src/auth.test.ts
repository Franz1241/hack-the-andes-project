import { describe, expect, it } from "vitest";

import { parseAllowedOrigins } from "./origins";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
	it("verifies the original password and rejects any other", async () => {
		const hash = await hashPassword("correct horse battery staple");

		expect(
			await verifyPassword({ hash, password: "correct horse battery staple" }),
		).toBe(true);
		expect(await verifyPassword({ hash, password: "wrong password" })).toBe(
			false,
		);
	});

	it("rejects hashes in an unknown format", async () => {
		expect(
			await verifyPassword({ hash: "scrypt:abc", password: "anything" }),
		).toBe(false);
	});
});

describe("parseAllowedOrigins", () => {
	it("splits, trims and drops empty entries", () => {
		expect(
			parseAllowedOrigins(" http://localhost:3001 ,https://app.example.com,, "),
		).toEqual(["http://localhost:3001", "https://app.example.com"]);
	});
});
