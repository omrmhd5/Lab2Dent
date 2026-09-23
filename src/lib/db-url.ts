import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  if (process.env.DATABASE_URL) {
    return;
  }

  for (const fileName of [".env.local", ".env"]) {
    const envPath = resolve(
      /* turbopackIgnore: true */ process.cwd(),
      fileName,
    );

    if (!existsSync(envPath)) {
      continue;
    }

    const contents = readFileSync(envPath, "utf8");

    for (const line of contents.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function stripChannelBinding(url: string) {
  return url
    .replace(/([?&])channel_binding=require&?/, "$1")
    .replace(/[?&]$/, "");
}

export function getDatabaseUrl() {
  loadEnvFile();

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  return stripChannelBinding(url);
}

export function getDirectDatabaseUrl() {
  loadEnvFile();

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is not set.");
  }

  return stripChannelBinding(url);
}
