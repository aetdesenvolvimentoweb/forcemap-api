import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  militaryId: text("military_id")
    .notNull()
    .references(() => military.id),
  role: text("role").notNull(),
  password: text("password").notNull(),
});

export const userRelations = relations(user, ({ one }) => ({
  military: one(military, {
    fields: [user.militaryId],
    references: [military.id],
  }),
}));
