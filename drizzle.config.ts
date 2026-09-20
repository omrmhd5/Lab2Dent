import { defineConfig } from "drizzle-kit";
import { getDirectDatabaseUrl } from "./src/lib/db-url";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDirectDatabaseUrl(),
  },
});
