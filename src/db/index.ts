import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/db-url";
import * as relations from "./relations";
import * as schema from "./schema";

const fullSchema = { ...schema, ...relations };

type Db = PostgresJsDatabase<typeof fullSchema>;

declare global {
  var __lab2dentDb: Db | undefined;
}

function createDb() {
  const connectionString = getDatabaseUrl();
  const client = postgres(connectionString, {
    max: 10,
    ssl: "require",
  });

  return drizzle(client, { schema: fullSchema });
}

function getDb() {
  if (process.env.NODE_ENV !== "production") {
    global.__lab2dentDb ??= createDb();
    return global.__lab2dentDb;
  }

  return createDb();
}

export const db = new Proxy({} as Db, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export type Database = Db;
