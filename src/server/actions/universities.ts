"use server";

import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orders, universities } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth";

export async function listUniversities(includeInactive = false) {
  const rows = await db
    .select()
    .from(universities)
    .orderBy(asc(universities.sortOrder), asc(universities.name));

  if (includeInactive) return rows;
  return rows.filter((row) => row.isActive);
}

export async function createUniversity(formData: FormData) {
  await requireStaffSession();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  const [last] = await db
    .select({ sortOrder: universities.sortOrder })
    .from(universities)
    .orderBy(desc(universities.sortOrder))
    .limit(1);

  await db.insert(universities).values({
    name,
    sortOrder: (last?.sortOrder ?? -1) + 1,
    isActive: true,
  });

  revalidatePath("/admin/universities");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function updateUniversity(formData: FormData) {
  await requireStaffSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name) {
    return { error: "Name is required." };
  }

  await db
    .update(universities)
    .set({
      name,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(universities.id, id));

  revalidatePath("/admin/universities");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function deleteUniversity(id: string) {
  await requireStaffSession();

  const [row] = await db
    .select({ id: universities.id, name: universities.name })
    .from(universities)
    .where(eq(universities.id, id))
    .limit(1);

  if (!row) {
    return { error: "That university was not found." };
  }

  await db.transaction(async (tx) => {
    await tx.delete(orders).where(eq(orders.studentUniversity, row.name));
    await tx.delete(universities).where(eq(universities.id, row.id));
  });

  revalidatePath("/admin/universities");
  revalidatePath("/admin");
  revalidatePath("/new-case");
  return { ok: true as const };
}
