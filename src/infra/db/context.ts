import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

const storage = new AsyncLocalStorage<Database>();

/**
 * Opens a request-scoped database context. The D1 binding only exists inside a
 * Worker request (`c.env.forcemap`), so this must wrap the request handling. Every
 * repository created at module load resolves its `db` lazily via {@link getDb}.
 */
export const runWithDb = <T>(d1: D1Database, fn: () => T): T => {
  const db = drizzle(d1, { schema });
  return storage.run(db, fn);
};

export const getDb = (): Database => {
  const db = storage.getStore();
  if (!db) {
    throw new Error(
      "Database context not initialized — the DB middleware must run before any repository access.",
    );
  }
  return db;
};
