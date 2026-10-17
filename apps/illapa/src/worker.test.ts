import type { IllapaEnv } from "@hack-the-andes-project/infra/alchemy.run";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	DEMO_REQUESTS_PATH,
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_CREATED,
	HTTP_STATUS_METHOD_NOT_ALLOWED,
	HTTP_STATUS_SERVICE_UNAVAILABLE,
} from "./constants";
import worker from "./worker";

const put = vi.fn().mockResolvedValue(undefined);
const fetchAssets = vi.fn().mockResolvedValue(new Response("marketing page"));
const environment = {
	DEMO_REQUESTS: { put },
	ASSETS: { fetch: fetchAssets },
} as unknown as IllapaEnv;
const endpoint = `https://illapa.app${DEMO_REQUESTS_PATH}`;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("demo request submissions", () => {
	it.each([
		{ name: "Ana", phone: "+51959178081" },
		{ name: "Ana", email: "ana@example.com" },
		{
			name: "Ana",
			company: "Transportes",
			phone: "+51959178081",
			email: "ana@example.com",
		},
	])("stores valid contact details: %j", async (payload) => {
		const response = await worker.fetch(
			new Request(endpoint, {
				method: "POST",
				body: JSON.stringify(payload),
			}),
			environment,
		);
		expect(response.status).toBe(HTTP_STATUS_CREATED);
		expect(put).toHaveBeenCalledOnce();
		const [key, value] = put.mock.calls[0] ?? [];
		const storedRequest = JSON.parse(value);
		expect(storedRequest).toEqual({
			...payload,
			submittedAt: expect.any(String),
		});
		expect(key).toMatch(new RegExp(`^${storedRequest.submittedAt}:`));
	});

	it.each([
		null,
		[],
		{},
		{ name: "   ", phone: "+51959178081" },
		{ name: "Ana" },
		{ name: "Ana", phone: "  ", email: "  " },
		{ name: "Ana", email: "invalid" },
		{ name: "Ana", phone: "+51959178081", email: "invalid" },
		{ name: "Ana", phone: 959178081 },
		{ name: "Ana", phone: "+51959178081", company: {} },
	])("rejects invalid payloads without storing them: %j", async (payload) => {
		const response = await worker.fetch(
			new Request(endpoint, {
				method: "POST",
				body: JSON.stringify(payload),
			}),
			environment,
		);
		expect(response.status).toBe(HTTP_STATUS_BAD_REQUEST);
		expect(put).not.toHaveBeenCalled();
	});

	it("rejects malformed JSON", async () => {
		const response = await worker.fetch(
			new Request(endpoint, {
				method: "POST",
				body: "{",
			}),
			environment,
		);
		expect(response.status).toBe(HTTP_STATUS_BAD_REQUEST);
		expect(put).not.toHaveBeenCalled();
	});

	it("rejects unsupported methods without exposing stored contacts", async () => {
		const response = await worker.fetch(new Request(endpoint), environment);
		expect(response.status).toBe(HTTP_STATUS_METHOD_NOT_ALLOWED);
		expect(response.headers.get("allow")).toBe("POST");
		expect(put).not.toHaveBeenCalled();
	});

	it("reports storage failures instead of confirming a submission", async () => {
		put.mockRejectedValueOnce(new Error("KV unavailable"));
		const response = await worker.fetch(
			new Request(endpoint, {
				method: "POST",
				body: JSON.stringify({ name: "Ana", email: "ana@example.com" }),
			}),
			environment,
		);
		expect(response.status).toBe(HTTP_STATUS_SERVICE_UNAVAILABLE);
	});

	it("gives separate requests unique keys", async () => {
		const requestOptions = {
			method: "POST",
			body: JSON.stringify({ name: "Ana", email: "ana@example.com" }),
		};
		await worker.fetch(new Request(endpoint, requestOptions), environment);
		await worker.fetch(new Request(endpoint, requestOptions), environment);
		expect(put.mock.calls[0]?.[0]).not.toBe(put.mock.calls[1]?.[0]);
	});

	it("serves other paths through the asset binding", async () => {
		const request = new Request("https://illapa.app/");
		const response = await worker.fetch(request, environment);
		expect(fetchAssets).toHaveBeenCalledWith(request);
		expect(await response.text()).toBe("marketing page");
		expect(put).not.toHaveBeenCalled();
	});
});
