"use server";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { orderFieldValues, orders, universities } from "@/db/schema";
import { readLocalizedPair } from "@/lib/bilingual";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { deleteStoredImages } from "@/lib/storage";

async function namesRequired() {
  const locale = await getLocale();
  return locale === "ar"
    ? "الاسم بالإنجليزية والعربية مطلوب."
    : "English and Arabic names are required.";
}

export async function listUniversities(includeInactive = false) {
  const rows = await db
    .select()
    .from(universities)
    .orderBy(asc(universities.sortOrder), asc(universities.name));

  if (includeInactive) return rows;
  return rows.filter((row) => row.isActive);
}

export async function createUniversity(formData: FormData) {
  await requireAdminSession();

  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );

  if (!name || !nameAr) {
    return { error: await namesRequired() };
  }

  const [last] = await db
    .select({ sortOrder: universities.sortOrder })
    .from(universities)
    .orderBy(desc(universities.sortOrder))
    .limit(1);

  await db.insert(universities).values({
    name,
    nameAr,
    sortOrder: (last?.sortOrder ?? -1) + 1,
    isActive: true,
  });

  revalidatePath("/dashboard/universities");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function updateUniversity(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name || !nameAr) {
    return { error: await namesRequired() };
  }

  await db
    .update(universities)
    .set({
      name,
      nameAr,
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(universities.id, id));

  revalidatePath("/dashboard/universities");
  revalidatePath("/new-case");
  return { ok: true as const };
}

export async function deleteUniversity(id: string) {
  await requireAdminSession();

  const [row] = await db
    .select({ id: universities.id, name: universities.name })
    .from(universities)
    .where(eq(universities.id, id))
    .limit(1);

  if (!row) {
    return { error: "That university was not found." };
  }

  const imageKeys = await db.transaction(async (tx) => {
    const existing = await tx
      .select({
        id: orders.id,
        paymentScreenshotKey: orders.paymentScreenshotKey,
      })
      .from(orders)
      .where(eq(orders.studentUniversity, row.name));
    const orderIds = existing.map((order) => order.id);
    const fields =
      orderIds.length === 0
        ? []
        : await tx
            .select({ imageKey: orderFieldValues.imageKey })
            .from(orderFieldValues)
            .where(inArray(orderFieldValues.orderId, orderIds));

    await tx.delete(orders).where(eq(orders.studentUniversity, row.name));
    await tx.delete(universities).where(eq(universities.id, row.id));

    return [
      ...existing.map((order) => order.paymentScreenshotKey),
      ...fields.map((field) => field.imageKey),
    ];
  });

  await deleteStoredImages(imageKeys);

  revalidatePath("/dashboard/universities");
  revalidatePath("/dashboard");
  revalidatePath("/new-case");
  return { ok: true as const };
}
