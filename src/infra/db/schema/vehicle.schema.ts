import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicle = sqliteTable("vehicle", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  situation: text("situation").notNull(),
  complement: text("complement"),
});
