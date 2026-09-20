import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDirectDatabaseUrl } from "../lib/db-url";
import { categories, staff, universities } from "./schema";

const universityNames = [
  "The British University in Egypt",
  "Cairo University",
  "Ain Shams University",
  "Alexandria University",
  "Mansoura University",
  "Tanta University",
  "Zagazig University",
  "Assiut University",
  "Minia University",
  "Suez Canal University",
  "Other",
];

const sampleCategories = [
  { name: "Crown - Zirconia", priceEgp: 2500, sortOrder: 0 },
  { name: "Crown - E.max", priceEgp: 2200, sortOrder: 1 },
  { name: "Veneer", priceEgp: 1800, sortOrder: 2 },
  { name: "Bridge unit", priceEgp: 2500, sortOrder: 3 },
  { name: "Night guard", priceEgp: 800, sortOrder: 4 },
];

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed the database.`);
  }

  return value;
}

async function seed() {
  const url = getDirectDatabaseUrl();
  const client = postgres(url, { max: 1, ssl: "require" });
  const db = drizzle(client);

  try {
    for (const [index, name] of universityNames.entries()) {
      const existing = await db
        .select({ id: universities.id })
        .from(universities)
        .where(eq(universities.name, name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(universities).values({ name, sortOrder: index });
      }
    }

    const existingCategories = await db.select({ id: categories.id }).from(categories).limit(1);

    if (existingCategories.length === 0) {
      await db.insert(categories).values(sampleCategories);
    }

    const admins = [
      {
        name: requiredEnv("ADMIN_NAME_1"),
        email: requiredEnv("ADMIN_EMAIL_1").toLowerCase(),
        password: requiredEnv("ADMIN_PASSWORD_1"),
      },
      {
        name: requiredEnv("ADMIN_NAME_2"),
        email: requiredEnv("ADMIN_EMAIL_2").toLowerCase(),
        password: requiredEnv("ADMIN_PASSWORD_2"),
      },
    ];

    for (const admin of admins) {
      const passwordHash = await bcrypt.hash(admin.password, 12);
      const [existing] = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.email, admin.email))
        .limit(1);

      if (existing) {
        await db
          .update(staff)
          .set({
            name: admin.name,
            passwordHash,
            role: "admin",
            isActive: true,
          })
          .where(eq(staff.id, existing.id));
      } else {
        await db.insert(staff).values({
          name: admin.name,
          email: admin.email,
          passwordHash,
          role: "admin",
          isActive: true,
        });
      }
    }

    console.log("Seed complete.");
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
