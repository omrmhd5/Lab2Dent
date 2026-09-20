import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDirectDatabaseUrl } from "../lib/db-url";
import { categories, staff, type StaffRole } from "./schema";

const sampleCategories = [
  { name: "Crown - Zirconia", priceEgp: 2500, sortOrder: 0 },
  { name: "Crown - E.max", priceEgp: 2200, sortOrder: 1 },
  { name: "Veneer", priceEgp: 1800, sortOrder: 2 },
  { name: "Bridge unit", priceEgp: 2500, sortOrder: 3 },
  { name: "Night guard", priceEgp: 800, sortOrder: 4 },
];

const demoStaff: {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}[] = [
  {
    name: "Admin",
    email: "admin@admin",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Employee",
    email: "employee@employee",
    password: "employee123",
    role: "employee",
  },
];

async function seed() {
  const url = getDirectDatabaseUrl();
  const client = postgres(url, { max: 1, ssl: "require" });
  const db = drizzle(client);

  try {
    const existingCategories = await db.select({ id: categories.id }).from(categories).limit(1);

    if (existingCategories.length === 0) {
      await db.insert(categories).values(sampleCategories);
    }

    for (const account of demoStaff) {
      const passwordHash = await bcrypt.hash(account.password, 12);
      const [existing] = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.email, account.email))
        .limit(1);

      if (existing) {
        await db
          .update(staff)
          .set({
            name: account.name,
            passwordHash,
            role: account.role,
            isActive: true,
          })
          .where(eq(staff.id, existing.id));
      } else {
        await db.insert(staff).values({
          name: account.name,
          email: account.email,
          passwordHash,
          role: account.role,
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
