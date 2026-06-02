import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { military } from "./military.schema";

export const militaryRank = sqliteTable("military_rank", {
  id: text("id").primaryKey(),
  abbreviation: text("abbreviation").notNull().unique(),
  order: integer("order").notNull().unique(),
});

export const militaryRankRelations = relations(militaryRank, ({ many }) => ({
  militaries: many(military),
}));
