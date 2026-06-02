import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const aca = sqliteTable("aca", {
  id: text("id").primaryKey(),
  militaryId: text("military_id")
    .notNull()
    .references(() => military.id),
  workPeriod: text("work_period").notNull(),
  workSchedule: text("work_schedule").notNull(),
});

export const acaRelations = relations(aca, ({ one }) => ({
  military: one(military, {
    fields: [aca.militaryId],
    references: [military.id],
  }),
}));
