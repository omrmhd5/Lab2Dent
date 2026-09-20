"use server";

import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, orders } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth";

export async function listCategories(includeInactive = false) {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  if (includeInactive) return rows;
  return rows.filter((row) => row.isActive);
}

export async function createCategory(formData: FormData) {
  await requireStaffSession();

  const name = String(formData.get("name") ?? "").trim();
  const priceEgp = Number(formData.get("priceEgp"));

  if (!name || !Number.isFinite(priceEgp) || priceEgp < 0) {
    return { error: "Name and a valid price are required." };
  }

  const [last] = await db
    .select({ sortOrder: categories.sortOrder })
    .from(categories)
    .orderBy(desc(categories.sortOrder))
    .limit(1);

  await db.insert(categories).values({
    name,
    priceEgp: Math.round(priceEgp),
    sortOrder: (last?.sortOrder ?? -1) + 1,
    isActive: true,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function updateCategory(formData: FormData) {
  await requireStaffSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const priceEgp = Number(formData.get("priceEgp"));
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name || !Number.isFinite(priceEgp) || priceEgp < 0) {
    return { error: "Name and a valid price are required." };
  }

  await db
    .update(categories)
    .set({
      name,
      priceEgp: Math.round(priceEgp),
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function reorderCategories(ids: string[]) {
  await requireStaffSession();

  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return { error: "Nothing to reorder." };

  await Promise.all(
    unique.map((id, index) =>
      db
        .update(categories)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(eq(categories.id, id)),
    ),
  );

  revalidatePath("/admin/categories");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function deactivateCategory(id: string) {
  await requireStaffSession();

  const [used] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.categoryId, id))
    .limit(1);

  if (used) {
    await db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categories.id, id));
  } else {
    await db.delete(categories).where(eq(categories.id, id));
  }

  revalidatePath("/admin/categories");
  revalidatePath("/new-case");
}
