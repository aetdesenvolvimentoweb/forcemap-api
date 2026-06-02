import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./user.schema";

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  token: text("token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  deviceInfo: text("device_info").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  lastAccessAt: integer("last_access_at", { mode: "timestamp_ms" }).notNull(),
});
