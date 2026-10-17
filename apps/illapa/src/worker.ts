/// <reference path="../cloudflare-env.d.ts" />
import { demoRequestSchema } from "@hack-the-andes-project/business/demo-request";
import type { IllapaEnv } from "@hack-the-andes-project/infra/alchemy.run";
import { createLogger } from "evlog";

import {
	DEMO_REQUESTS_PATH,
	HTTP_STATUS_BAD_REQUEST,
	HTTP_STATUS_CREATED,
	HTTP_STATUS_METHOD_NOT_ALLOWED,
	HTTP_STATUS_SERVICE_UNAVAILABLE,
} from "./constants";

export default {
	async fetch(request: Request, env: IllapaEnv) {
		const { pathname } = new URL(request.url);
		if (pathname !== DEMO_REQUESTS_PATH) {
			return env.ASSETS.fetch(request);
		}
		const log = createLogger({
			service: "illapa",
			method: request.method,
			path: pathname,
		});
		try {
			if (request.method !== "POST") {
				log.set({ status: HTTP_STATUS_METHOD_NOT_ALLOWED });
				return new Response(null, {
					status: HTTP_STATUS_METHOD_NOT_ALLOWED,
					headers: { allow: "POST" },
				});
			}
			const result = demoRequestSchema.safeParse(
				await request.json().catch(() => null),
			);
			if (!result.success) {
				log.set({ status: HTTP_STATUS_BAD_REQUEST });
				return Response.json(
					{ error: "invalid_demo_request" },
					{ status: HTTP_STATUS_BAD_REQUEST },
				);
			}
			const submittedAt = new Date().toISOString();
			const requestId = crypto.randomUUID();
			await env.DEMO_REQUESTS.put(
				`${submittedAt}:${requestId}`,
				JSON.stringify({ ...result.data, submittedAt }),
			);
			log.set({ status: HTTP_STATUS_CREATED, demoRequest: { requestId } });
			return new Response(null, { status: HTTP_STATUS_CREATED });
		} catch (error) {
			log.error(
				error instanceof Error
					? error
					: new Error("Demo request storage failed"),
			);
			log.set({ status: HTTP_STATUS_SERVICE_UNAVAILABLE });
			return Response.json(
				{ error: "demo_request_unavailable" },
				{ status: HTTP_STATUS_SERVICE_UNAVAILABLE },
			);
		} finally {
			log.emit();
		}
	},
} satisfies ExportedHandler<IllapaEnv>;
