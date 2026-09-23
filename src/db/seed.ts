import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDirectDatabaseUrl } from "../lib/db-url";
import { siteSettings, staff, universities, type StaffRole } from "./schema";

const sampleUniversities = [
  { name: "Cairo University", sortOrder: 0 },
  { name: "Ain Shams University", sortOrder: 1 },
  { name: "Alexandria University", sortOrder: 2 },
  { name: "Mansoura University", sortOrder: 3 },
  { name: "Tanta University", sortOrder: 4 },
];

const demoStaff: {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}[] = [
  {
    name: "Admin",
    email: "admin@admin.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Employee",
    email: "employee@employee.com",
    password: "employee123",
    role: "employee",
  },
];

async function seed() {
  const url = getDirectDatabaseUrl();
  const client = postgres(url, { max: 1, ssl: "require" });
  const db = drizzle(client);

  try {
    const existingUniversities = await db
      .select({ id: universities.id })
      .from(universities)
      .limit(1);

    if (existingUniversities.length === 0) {
      await db.insert(universities).values(sampleUniversities);
    }

    const [existingSettings] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    if (!existingSettings) {
      await db.insert(siteSettings).values({
        id: 1,
        instapayLink: "tel:01000000000",
      });
    }

    const legacyEmails: [string, string][] = [
      ["admin@admin", "admin@admin.com"],
      ["employee@employee", "employee@employee.com"],
    ];

    for (const [oldEmail, newEmail] of legacyEmails) {
      await db
        .update(staff)
        .set({ email: newEmail })
        .where(eq(staff.email, oldEmail));
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
