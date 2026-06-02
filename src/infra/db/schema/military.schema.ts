import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { militaryRank } from "./military-rank.schema";

export const military = sqliteTable("military", {
  id: text("id").primaryKey(),
  militaryRankId: text("military_rank_id")
    .notNull()
    .references(() => militaryRank.id),
  rg: integer("rg").notNull().unique(),
  name: text("name").notNull(),
});

export const militaryRelations = relations(military, ({ one }) => ({
  militaryRank: one(militaryRank, {
    fields: [military.militaryRankId],
    references: [militaryRank.id],
  }),
}));
