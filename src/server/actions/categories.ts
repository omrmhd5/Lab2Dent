"use server";

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  categoryFields,
  orderFieldValues,
  orders,
} from "@/db/schema";
import {
  buildCategoryGroups,
  localizeGroups,
  isCategoryGroup,
  isSelectableCategory,
  type CategoryFieldDef,
  type CategoryRecord,
} from "@/lib/categories";
import { readLocalizedPair } from "@/lib/bilingual";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { removeOrdersFromCategoryStats } from "@/lib/category-stats";
import { deleteStoredImages } from "@/lib/storage";

async function namesRequired() {
  const locale = await getLocale();
  return locale === "ar"
    ? "الاسم بالإنجليزية والعربية مطلوب."
    : "English and Arabic names are required.";
}

function toRecord(row: typeof categories.$inferSelect): CategoryRecord {
  return {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    nameAr: row.nameAr,
    priceEgp: row.priceEgp,
    costEgp: row.costEgp,
    confirmedOrderCount: row.confirmedOrderCount,
    confirmedTotalPriceEgp: row.confirmedTotalPriceEgp,
    confirmedTotalCostEgp: row.confirmedTotalCostEgp,
    confirmedTotalProfitEgp: row.confirmedTotalProfitEgp,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export async function listCategories(includeInactive = false) {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const mapped = rows.map(toRecord);
  if (includeInactive) return mapped;
  return mapped.filter((row) => row.isActive);
}

export async function listPublicCategoryGroups() {
  const rows = await listCategories(false);
  const fields = await db
    .select({
      id: categoryFields.id,
      categoryId: categoryFields.categoryId,
      label: categoryFields.label,
      labelAr: categoryFields.labelAr,
      type: categoryFields.type,
      priceEgp: categoryFields.priceEgp,
      required: categoryFields.required,
      sortOrder: categoryFields.sortOrder,
    })
    .from(categoryFields)
    .orderBy(asc(categoryFields.sortOrder), asc(categoryFields.label));

  const fieldsByCategory = new Map<string, CategoryFieldDef[]>();
  for (const field of fields) {
    const list = fieldsByCategory.get(field.categoryId) ?? [];
    list.push({
      id: field.id,
      label: field.label,
      labelAr: field.labelAr,
      type: field.type,
      required: field.required,
      priceEgp: field.priceEgp,
    });
    fieldsByCategory.set(field.categoryId, list);
  }

  return localizeGroups(
    buildCategoryGroups(rows, fieldsByCategory),
    await getLocale(),
  );
}

async function nextSortOrder(parentId: string | null) {
  const [last] = await db
    .select({ sortOrder: categories.sortOrder })
    .from(categories)
    .where(
      parentId
        ? eq(categories.parentId, parentId)
        : and(isNull(categories.parentId), isNull(categories.priceEgp)),
    )
    .orderBy(desc(categories.sortOrder))
    .limit(1);

  return (last?.sortOrder ?? -1) + 1;
}

export async function createCategoryGroup(formData: FormData) {
  await requireAdminSession();

  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );
  if (!name || !nameAr) return { error: await namesRequired() };

  await db.insert(categories).values({
    name,
    nameAr,
    sortOrder: await nextSortOrder(null),
    isActive: true,
    priceEgp: null,
    parentId: null,
  });

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

export async function createSubcategory(formData: FormData) {
  await requireAdminSession();

  const parentId = String(formData.get("parentId") ?? "").trim();
  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );
  const priceEgp = Number(formData.get("priceEgp"));
  const costEgp = Number(formData.get("costEgp"));

  if (
    !parentId ||
    !name ||
    !nameAr ||
    !Number.isFinite(priceEgp) ||
    priceEgp < 0 ||
    !Number.isFinite(costEgp) ||
    costEgp < 0
  ) {
    return {
      error:
        (await getLocale()) === "ar"
          ? "الاسم بالإنجليزية والعربية والسعر والتكلفة مطلوبة."
          : "English name, Arabic name, price, and cost are required.",
    };
  }

  const [parent] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, parentId))
    .limit(1);

  if (!parent || !isCategoryGroup(toRecord(parent))) {
    return { error: "Pick a valid category group." };
  }

  const isActive = String(formData.get("isActive") ?? "") === "on";

  await db.insert(categories).values({
    parentId,
    name,
    nameAr,
    priceEgp: Math.round(priceEgp),
    costEgp: Math.round(costEgp),
    sortOrder: await nextSortOrder(parentId),
    isActive,
  });

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateCategoryGroup(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name || !nameAr) return { error: await namesRequired() };

  await db
    .update(categories)
    .set({ name, nameAr, isActive, updatedAt: new Date() })
    .where(eq(categories.id, id));

  if (!isActive) {
    await db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categories.parentId, id));
  }

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateSubcategory(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const { english: name, arabic: nameAr } = readLocalizedPair(
    formData,
    "name",
    "nameAr",
  );
  const priceEgp = Number(formData.get("priceEgp"));
  const costEgp = Number(formData.get("costEgp"));
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (
    !id ||
    !name ||
    !nameAr ||
    !Number.isFinite(priceEgp) ||
    priceEgp < 0 ||
    !Number.isFinite(costEgp) ||
    costEgp < 0
  ) {
    return {
      error:
        (await getLocale()) === "ar"
          ? "الاسم بالإنجليزية والعربية والسعر والتكلفة مطلوبة."
          : "English name, Arabic name, price, and cost are required.",
    };
  }

  await db
    .update(categories)
    .set({
      name,
      nameAr,
      priceEgp: Math.round(priceEgp),
      costEgp: Math.round(costEgp),
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderCategoryGroups(ids: string[]) {
  await requireAdminSession();

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

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reorderSubcategories(parentId: string, ids: string[]) {
  await requireAdminSession();

  const unique = [...new Set(ids.filter(Boolean))];
  if (!parentId || unique.length === 0) {
    return { error: "Nothing to reorder." };
  }

  await Promise.all(
    unique.map((id, index) =>
      db
        .update(categories)
        .set({ sortOrder: index, updatedAt: new Date() })
        .where(and(eq(categories.id, id), eq(categories.parentId, parentId))),
    ),
  );

  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
  return { ok: true as const };
}

function revalidateCatalog() {
  revalidatePath("/dashboard/categories", "layout");
  revalidatePath("/new-case");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await requireAdminSession();

  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!row) return { error: "That item was not found." };

  const record = toRecord(row);

  if (!isCategoryGroup(record) && !isSelectableCategory(record)) {
    return { error: "That item cannot be deleted." };
  }

  const imageKeys = await db.transaction(async (tx) => {
    async function keysFor(orderIds: string[]) {
      if (orderIds.length === 0) return [] as Array<string | null>;
      const shots = await tx
        .select({ paymentScreenshotKey: orders.paymentScreenshotKey })
        .from(orders)
        .where(inArray(orders.id, orderIds));
      const fields = await tx
        .select({ imageKey: orderFieldValues.imageKey })
        .from(orderFieldValues)
        .where(inArray(orderFieldValues.orderId, orderIds));
      return [
        ...shots.map((row) => row.paymentScreenshotKey),
        ...fields.map((row) => row.imageKey),
      ];
    }

    if (isCategoryGroup(record)) {
      const children = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parentId, id));

      const childIds = children.map((child) => child.id);

      if (childIds.length > 0) {
        const affectedOrders = await tx
          .select({
            id: orders.id,
            categoryId: orders.categoryId,
            priceEgp: orders.priceEgp,
            statsCostEgp: orders.statsCostEgp,
            statsProfitEgp: orders.statsProfitEgp,
          })
          .from(orders)
          .where(inArray(orders.categoryId, childIds));

        await removeOrdersFromCategoryStats(tx, affectedOrders);
        const keys = await keysFor(affectedOrders.map((order) => order.id));
        await tx.delete(orders).where(inArray(orders.categoryId, childIds));
        await tx.delete(categories).where(eq(categories.id, id));
        return keys;
      }

      await tx.delete(categories).where(eq(categories.id, id));
      return [] as Array<string | null>;
    }

    const affectedOrders = await tx
      .select({
        id: orders.id,
        categoryId: orders.categoryId,
        priceEgp: orders.priceEgp,
        statsCostEgp: orders.statsCostEgp,
        statsProfitEgp: orders.statsProfitEgp,
      })
      .from(orders)
      .where(eq(orders.categoryId, id));

    await removeOrdersFromCategoryStats(tx, affectedOrders);
    const keys = await keysFor(affectedOrders.map((order) => order.id));
    await tx.delete(orders).where(eq(orders.categoryId, id));
    await tx.delete(categories).where(eq(categories.id, id));
    return keys;
  });

  await deleteStoredImages(imageKeys);

  revalidateCatalog();
  revalidatePath("/dashboard");
  return { ok: true as const };
}
