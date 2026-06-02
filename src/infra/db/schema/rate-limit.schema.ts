import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rateLimit = sqliteTable("rate_limit", {
  key: text("key").primaryKey(),
  hits: integer("hits").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
