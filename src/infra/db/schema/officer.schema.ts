import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const officer = sqliteTable("officer", {
  id: text("id").primaryKey(),
  militaryId: text("military_id")
    .notNull()
    .references(() => military.id),
  workPeriod: text("work_period").notNull(),
  workSchedule: text("work_schedule").notNull(),
});

export const officerRelations = relations(officer, ({ one }) => ({
  military: one(military, {
    fields: [officer.militaryId],
    references: [military.id],
  }),
}));
