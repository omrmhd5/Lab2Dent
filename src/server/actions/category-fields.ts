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
import { digitsOnly, isDigitsOnly } from "@/lib/numeric-input";
import { getLocale } from "@/lib/locale";

async function revalidateFields(categoryId: string) {
  const subcategory = await requireSubcategory(categoryId);
  if (subcategory?.parentId) {
    revalidatePath(`/dashboard/categories/${subcategory.parentId}`);
  }
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
  if (
    type === "text" ||
    type === "number" ||
    type === "image" ||
    type === "price"
  ) {
    return type;
  }
  return null;
}

function parseFieldPriceEgp(
  value: FormDataEntryValue | null,
  type: CategoryFieldType,
) {
  if (type !== "price") return null;
  const raw = digitsOnly(String(value ?? "").trim());
  if (!raw || !isDigitsOnly(raw)) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

async function priceRequiredError() {
  const locale = await getLocale();
  return locale === "ar"
    ? "أدخل مبلغ الإضافة بالجنيه."
    : "Enter the add-on amount in EGP.";
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
  const priceEgp = parseFieldPriceEgp(formData.get("priceEgp"), type ?? "text");

  if (!categoryId || !label || !labelAr || !type) {
    return { error: await labelsRequired() };
  }

  if (type === "price" && priceEgp === null) {
    return { error: await priceRequiredError() };
  }

  const subcategory = await requireSubcategory(categoryId);
  if (!subcategory) return { error: "Pick a subcategory." };

  await db.insert(categoryFields).values({
    categoryId,
    label,
    labelAr,
    type,
    priceEgp,
    required,
    sortOrder: await nextSortOrder(categoryId),
  });

  await revalidateFields(categoryId);
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
  const priceEgp = parseFieldPriceEgp(formData.get("priceEgp"), type ?? "text");

  if (!id || !categoryId || !label || !labelAr || !type) {
    return { error: await labelsRequired() };
  }

  if (type === "price" && priceEgp === null) {
    return { error: await priceRequiredError() };
  }

  const subcategory = await requireSubcategory(categoryId);
  if (!subcategory) return { error: "Pick a subcategory." };

  await db
    .update(categoryFields)
    .set({
      label,
      labelAr,
      type,
      priceEgp,
      required,
      updatedAt: new Date(),
    })
    .where(eq(categoryFields.id, id));

  await revalidateFields(categoryId);
  return { ok: true as const };
}

export async function deleteCategoryField(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!id || !categoryId) return { error: "Missing field." };

  await db.delete(categoryFields).where(eq(categoryFields.id, id));

  await revalidateFields(categoryId);
  return { ok: true as const };
}
