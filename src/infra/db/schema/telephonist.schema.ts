import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const telephonist = sqliteTable("telephonist", {
  id: text("id").primaryKey(),
  militaryId: text("military_id")
    .notNull()
    .references(() => military.id),
  workPeriod: text("work_period").notNull(),
  workSchedule: text("work_schedule").notNull(),
});

export const telephonistRelations = relations(telephonist, ({ one }) => ({
  military: one(military, {
    fields: [telephonist.militaryId],
    references: [military.id],
  }),
}));
