"use server";

import { asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  categoryFields,
  type CategoryFieldType,
} from "@/db/schema";
import { isSelectableCategory, type CategoryRecord } from "@/lib/categories";
import { readLocalizedPair } from "@/lib/bilingual";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";

function revalidateFields() {
  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
}

async function requireSubcategory(categoryId: string) {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!row || !isSelectableCategory(row as CategoryRecord)) {
    return null;
  }

  return row;
}

async function labelsRequired() {
  const locale = await getLocale();
  return locale === "ar"
    ? "التسمية بالإنجليزية والعربية مطلوبة."
    : "English and Arabic labels are required.";
}

function parseType(value: FormDataEntryValue | null): CategoryFieldType | null {
  const type = String(value ?? "");
  if (type === "text" || type === "image") return type;
  return null;
}

async function nextSortOrder(categoryId: string) {
  const [last] = await db
    .select({ sortOrder: categoryFields.sortOrder })
    .from(categoryFields)
    .where(eq(categoryFields.categoryId, categoryId))
    .orderBy(desc(categoryFields.sortOrder))
    .limit(1);

  return (last?.sortOrder ?? -1) + 1;
}

export async function listCategoryFields(categoryId: string) {
  await requireAdminSession();

  return db
    .select()
    .from(categoryFields)
    .where(eq(categoryFields.categoryId, categoryId))
    .orderBy(asc(categoryFields.sortOrder), asc(categoryFields.label));
}

export async function createCategoryField(formData: FormData) {
  await requireAdminSession();

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const { english: label, arabic: labelAr } = readLocalizedPair(
    formData,
    "label",
    "labelAr",
  );
  const type = parseType(formData.get("type"));
  const required = String(formData.get("required") ?? "") === "on";

  if (!categoryId || !label || !labelAr || !type) {
    return { error: await labelsRequired() };
  }

  const subcategory = await requireSubcategory(categoryId);
  if (!subcategory) return { error: "Pick a subcategory." };

  await db.insert(categoryFields).values({
    categoryId,
    label,
    labelAr,
    type,
    required,
    sortOrder: await nextSortOrder(categoryId),
  });

  revalidateFields();
  return { ok: true as const };
}

export async function updateCategoryField(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const { english: label, arabic: labelAr } = readLocalizedPair(
    formData,
    "label",
    "labelAr",
  );
  const type = parseType(formData.get("type"));
  const required = String(formData.get("required") ?? "") === "on";

  if (!id || !categoryId || !label || !labelAr || !type) {
    return { error: await labelsRequired() };
  }

  const subcategory = await requireSubcategory(categoryId);
  if (!subcategory) return { error: "Pick a subcategory." };

  await db
    .update(categoryFields)
    .set({ label, labelAr, type, required, updatedAt: new Date() })
    .where(eq(categoryFields.id, id));

  revalidateFields();
  return { ok: true as const };
}

export async function deleteCategoryField(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!id || !categoryId) return { error: "Missing field." };

  await db.delete(categoryFields).where(eq(categoryFields.id, id));

  revalidateFields();
  return { ok: true as const };
}
