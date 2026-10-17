// Signed session cookie: reads inside this window skip the session + user
// SELECTs. Revocation (sign-out elsewhere) can lag by up to this long.
export const SESSION_COOKIE_CACHE_MAX_AGE_S = 300;

// workerd's SubtleCrypto caps PBKDF2 at 100_000 iterations, so this sits at
// the ceiling. Below OWASP's SHA-256 target but the most Workers allow.
export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_KEY_LENGTH_BYTES = 32;
export const PBKDF2_SALT_LENGTH_BYTES = 16;
export const PBKDF2_ALGORITHM_TAG = "pbkdf2-sha256";

export const RATE_LIMIT_WINDOW_S = 60;
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const SIGN_IN_RATE_LIMIT_MAX_REQUESTS = 5;
export const SIGN_UP_RATE_LIMIT_MAX_REQUESTS = 3;

export const NATIVE_APP_SCHEME_ORIGIN = "hack-the-andes-project://";
export const EXPO_DEV_ORIGINS = ["exp://", "http://localhost:8081"];
