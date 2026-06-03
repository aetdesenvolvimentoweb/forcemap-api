import { AsyncLocalStorage } from "node:async_hooks";

export type AppEnv = Record<string, string | undefined>;

const storage = new AsyncLocalStorage<AppEnv>();

/**
 * Opens a request-scoped environment context. On Cloudflare Workers, vars and
 * secrets are only available through the per-request `c.env` binding — never on
 * `globalThis`. This must wrap request handling (alongside {@link runWithDb}) so
 * that adapters created at module load can resolve secrets lazily via {@link getEnv}.
 */
export const runWithEnv = <T>(env: AppEnv, fn: () => T): T =>
  storage.run(env, fn);

/**
 * Returns the request-scoped environment. Returns an empty object when called
 * outside a request context (e.g. module load), so callers must handle missing
 * values explicitly rather than relying on a fallback secret.
 */
export const getEnv = (): AppEnv => storage.getStore() ?? {};
