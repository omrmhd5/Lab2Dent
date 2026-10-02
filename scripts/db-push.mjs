import { spawnSync } from "node:child_process";
import { databaseHost, loadEnvFile } from "./load-env-file.mjs";

const envIndex = process.argv.indexOf("--env");
const envFile =
  envIndex !== -1 && process.argv[envIndex + 1]
    ? process.argv[envIndex + 1]
    : ".env.local";

try {
  loadEnvFile(envFile);
} catch (error) {
  if (envFile === ".env.production.db") {
    console.error(
      "Missing .env.production.db. Copy .env.production.db.example and add the doclobia Neon URLs.",
    );
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
}

const directUrl =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

console.log(`Pushing schema with ${envFile}`);
console.log(`Database host: ${databaseHost(directUrl)}`);

const result = spawnSync("drizzle-kit", ["push"], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
