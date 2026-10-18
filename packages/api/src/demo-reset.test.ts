import { describe, expect, it } from "vitest";

import { verifyDemoResetSecret } from "./demo-reset";

const secret = "demo-reset-test-secret-long-enough-for-auth";

describe("demo reset secret", () => {
	it("accepts exactly the configured secret", () => {
		expect(verifyDemoResetSecret(secret, secret)).toBe(true);
	});

	it.each([undefined, "", "wrong", `${secret}x`, secret.slice(1)])(
		"rejects missing and incorrect secrets (%s)",
		(provided) => {
			expect(verifyDemoResetSecret(provided, secret)).toBe(false);
		},
	);

	it("fails closed with an empty configuration", () => {
		expect(verifyDemoResetSecret("", "")).toBe(false);
		expect(verifyDemoResetSecret(undefined, "")).toBe(false);
		expect(verifyDemoResetSecret(undefined, undefined)).toBe(false);
		expect(verifyDemoResetSecret(secret, undefined)).toBe(false);
	});
});
