import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/db-url";
import * as relations from "./relations";
import * as schema from "./schema";

const fullSchema = { ...schema, ...relations };

type Db = PostgresJsDatabase<typeof fullSchema>;
type Sql = ReturnType<typeof postgres>;

declare global {
  var __lab2dentDb: Db | undefined;
  var __lab2dentSql: Sql | undefined;
  var __lab2dentDbTag: object | undefined;
}

function createDb() {
  const client = postgres(getDatabaseUrl(), {
    max: 10,
    ssl: "require",
  });

  return {
    client,
    db: drizzle(client, { schema: fullSchema }),
  };
}

function getDb() {
  if (process.env.NODE_ENV !== "production") {
    if (global.__lab2dentDbTag !== fullSchema) {
      void global.__lab2dentSql?.end({ timeout: 0 });
      const created = createDb();
      global.__lab2dentSql = created.client;
      global.__lab2dentDb = created.db;
      global.__lab2dentDbTag = fullSchema;
    }

    return global.__lab2dentDb!;
  }

  return createDb().db;
}

export const db = new Proxy({} as Db, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver);
  },
});

export type Database = Db;
