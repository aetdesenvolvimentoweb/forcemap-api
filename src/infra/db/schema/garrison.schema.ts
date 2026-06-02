import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";
import { vehicle } from "./vehicle.schema";

export const garrison = sqliteTable("garrison", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicle.id),
});

export const garrisonMilitary = sqliteTable(
  "garrison_military",
  {
    garrisonId: text("garrison_id")
      .notNull()
      .references(() => garrison.id, { onDelete: "cascade" }),
    militaryId: text("military_id")
      .notNull()
      .references(() => military.id),
    workPeriod: text("work_period").notNull(),
    workSchedule: text("work_schedule").notNull(),
  },
  (table) => [primaryKey({ columns: [table.garrisonId, table.militaryId] })],
);

export const garrisonRelations = relations(garrison, ({ one, many }) => ({
  vehicle: one(vehicle, {
    fields: [garrison.vehicleId],
    references: [vehicle.id],
  }),
  militaryInGarrison: many(garrisonMilitary),
}));

export const garrisonMilitaryRelations = relations(
  garrisonMilitary,
  ({ one }) => ({
    garrison: one(garrison, {
      fields: [garrisonMilitary.garrisonId],
      references: [garrison.id],
    }),
    military: one(military, {
      fields: [garrisonMilitary.militaryId],
      references: [military.id],
    }),
  }),
);
