import { createRequire } from "node:module";
import { call } from "@orpc/server";
import { createRequestLogger } from "evlog";
import { afterAll, describe, expect, expectTypeOf, it, vi } from "vitest";

import type { Context } from "./context";
import { organizationProcedure } from "./index";

const databaseRequire = createRequire(
	import.meta.resolve("@hack-the-andes-project/db"),
);
vi.doMock(databaseRequire.resolve("mysql2/promise"), () => ({
	default: {
		createConnection: vi.fn(async () => ({
			config: {},
			query: vi.fn(),
			end: vi.fn(),
		})),
	},
}));

const { createDb } = await import("@hack-the-andes-project/db");
const { createAuth } = await import("@hack-the-andes-project/auth");
const database = await createDb({
	host: "mock",
	port: Number.NaN,
	user: "mock",
	password: "mock",
	database: "mock",
});
const auth = createAuth(
	{
		BETTER_AUTH_URL: "https://api.example.com",
		BETTER_AUTH_SECRET: "test-secret-for-organization-procedure",
		ALLOWED_ORIGINS: "https://app.example.com",
	},
	database,
);
const createdAt = new Date("2026-10-17T00:00:00.000Z");
const session = {
	user: {
		id: "fleet-owner",
		name: "Fleet Owner",
		email: "owner@example.com",
		emailVerified: true,
		createdAt,
		updatedAt: createdAt,
	},
	session: {
		id: "session",
		userId: "fleet-owner",
		token: "session-token",
		createdAt,
		updatedAt: createdAt,
		expiresAt: new Date("2026-10-18T00:00:00.000Z"),
		activeOrganizationId: "selected-organization",
	},
};

function contextFor(session: Context["session"]): Context {
	return {
		db: database,
		auth,
		log: createRequestLogger(),
		session,
		waitUntil: (promise) => void promise,
	};
}

const procedure = organizationProcedure.handler(({ context }) => {
	expectTypeOf(context.organizationId).toEqualTypeOf<string>();
	expectTypeOf(context.session).toEqualTypeOf<
		NonNullable<Context["session"]>
	>();
	return context.organizationId;
});

afterAll(async () => {
	await database.$client.end();
});

describe("organizationProcedure", () => {
	it("rejects an unauthenticated request", async () => {
		await expect(
			call(procedure, undefined, { context: contextFor(null) }),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
	});

	it.each([null, undefined, ""])(
		"rejects an authenticated session without an active organization (%s)",
		async (activeOrganizationId) => {
			await expect(
				call(procedure, undefined, {
					context: contextFor({
						...session,
						session: { ...session.session, activeOrganizationId },
					}),
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		},
	);

	it("passes the selected organization to downstream handlers", async () => {
		await expect(
			call(procedure, undefined, { context: contextFor(session) }),
		).resolves.toBe(session.session.activeOrganizationId);
	});
});
