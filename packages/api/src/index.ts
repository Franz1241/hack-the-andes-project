import { ORPCError, os } from "@orpc/server";

import {
	MAX_LOGGED_ERROR_MESSAGE_CHARS,
	MAX_LOGGED_ID_CHARS,
} from "./constants";
import type { Context } from "./context";

export const o = os.$context<Context>();

interface ProcedureLogEntry {
	path: string;
	durationMs: number;
	ok: boolean;
	outputId?: string;
	code?: string;
	status?: number;
	message?: string;
}

// One entry per procedure, collected into a `procedures` ARRAY on the wide
// event. evlog concatenates arrays across `set` calls, so a batched request
// (one HTTP request, many procedures) records every call instead of a single
// last-wins scalar.
const withLogger = o.middleware(async ({ context, path, next }) => {
	const procedurePath = path.join(".");
	const startedAt = performance.now();
	try {
		const result = await next();
		const entry: ProcedureLogEntry = {
			path: procedurePath,
			durationMs: Math.round(performance.now() - startedAt),
			ok: true,
		};
		const output: unknown = result.output;
		if (
			output !== null &&
			typeof output === "object" &&
			"id" in output &&
			typeof output.id === "string"
		) {
			entry.outputId = output.id.slice(0, MAX_LOGGED_ID_CHARS);
		}
		context.log.set({ procedures: [entry] });
		return result;
	} catch (error) {
		const entry: ProcedureLogEntry = {
			path: procedurePath,
			durationMs: Math.round(performance.now() - startedAt),
			ok: false,
		};
		if (error instanceof ORPCError) {
			// Expected client errors (4xx) stay on the failing procedure; one
			// batched UNAUTHORIZED must not escalate the whole request's event.
			entry.code = error.code;
			entry.status = error.status;
			entry.message = error.message;
		} else {
			entry.code = error instanceof Error ? error.name : "Error";
			entry.message = (
				error instanceof Error ? error.message : String(error)
			).slice(0, MAX_LOGGED_ERROR_MESSAGE_CHARS);
			context.log.error(
				error instanceof Error ? error : new Error(String(error)),
			);
		}
		context.log.set({ procedures: [entry] });
		throw error;
	}
});

export const publicProcedure = o.use(withLogger);

// The server's global guard already rejects session-less requests outside the
// public allowlist; this narrows `session` to non-null for procedure code and
// keeps procedures safe if they are ever called outside that pipeline.
const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			session: context.session,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);
