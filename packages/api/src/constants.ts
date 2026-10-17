export const MAX_LOGGED_ID_CHARS = 64;
export const MAX_LOGGED_ERROR_MESSAGE_CHARS = 256;

// Procedures reachable without a session. The server's global auth guard lets
// these through, and the web batch link keeps them out of batches so a public
// call never rides inside a guarded `/rpc/__batch__` request.
export const PUBLIC_PROCEDURE_PATHS: ReadonlySet<string> = new Set([
	"healthCheck",
]);
