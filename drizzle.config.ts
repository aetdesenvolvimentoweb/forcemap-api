import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/infra/db/schema/index.ts",
  out: "./drizzle",
});
