import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rateLimit = sqliteTable("rate_limit", {
  key: text("key").primaryKey(),
  // JSON array de timestamps (epoch ms) das tentativas dentro da janela
  attempts: text("attempts", { mode: "json" })
    .notNull()
    .$type<number[]>()
    .default([]),
  blockedUntil: integer("blocked_until", { mode: "timestamp_ms" }),
});
