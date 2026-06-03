import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const serviceSwap = sqliteTable("service_swap", {
  id: text("id").primaryKey(),
  substitutedMilitaryId: text("substituted_military_id")
    .notNull()
    .references(() => military.id),
  substituteMilitaryId: text("substitute_military_id")
    .notNull()
    .references(() => military.id),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
});
