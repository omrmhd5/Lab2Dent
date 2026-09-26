"use server";

import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  categoryFields,
  orderEvents,
  orderFieldValues,
  orders,
  staff,
  universities,
  type OrderStatus,
} from "@/db/schema";
import { requireAdminSession, requireStaffSession } from "@/lib/auth";
import { loadOrderScope } from "@/lib/order-scope";
import { generateOrderCode } from "@/lib/order-code";
import { formatEgp } from "@/lib/utils";
import {
  deleteStoredImages,
  saveCaseImage,
  savePaymentScreenshot,
} from "@/lib/storage";
import {
  formatCategoryNames,
  isSelectableCategory,
  sumSelectedPriceFieldAddons,
  type CategoryFieldDef,
  type CategoryRecord,
} from "@/lib/categories";
import {
  applyOrderStatusStatsTransition,
  removeOrdersFromCategoryStats,
} from "@/lib/category-stats";
import { pickLocale } from "@/lib/bilingual";
import { getLocale } from "@/lib/locale";
import { statusesForRole } from "@/lib/status";
import { isDigitsOnly } from "@/lib/numeric-input";
import { isEgyptianMobile, normalizePhone } from "@/lib/utils";

export type CreateCaseState = {
  error?: string;
  code?: string;
};

export async function createCase(
  _prev: CreateCaseState,
  formData: FormData,
): Promise<CreateCaseState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const universityId = String(formData.get("universityId") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const screenshot = formData.get("screenshot");

  if (!name || !phone || !universityId || !categoryId) {
    return { error: "Fill in every required field." };
  }

  if (!isEgyptianMobile(phone)) {
    return { error: "Enter an Egyptian mobile number starting with 01." };
  }

  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return { error: "Upload an Instapay screenshot." };
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.isActive, true)))
    .limit(1);

  if (!category || !isSelectableCategory(category as CategoryRecord)) {
    return { error: "That service is no longer available." };
  }

  let parent: CategoryRecord | null = null;
  if (category.parentId) {
    const [parentRow] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, category.parentId))
      .limit(1);
    parent = parentRow ? (parentRow as CategoryRecord) : null;
  }

  const categoryNames = formatCategoryNames(category as CategoryRecord, parent);
  const locale = await getLocale();

  const [university] = await db
    .select()
    .from(universities)
    .where(
      and(eq(universities.id, universityId), eq(universities.isActive, true)),
    )
    .limit(1);

  if (!university) {
    return { error: "That university is no longer available." };
  }

  const fields = await db
    .select()
    .from(categoryFields)
    .where(eq(categoryFields.categoryId, category.id))
    .orderBy(asc(categoryFields.sortOrder));

  const answers: {
    fieldId: string;
    label: string;
    labelAr: string | null;
    type: CategoryFieldDef["type"];
    textValue: string | null;
    imageKey: string | null;
    priceEgp: number | null;
    sortOrder: number;
  }[] = [];

  const selectedPriceFieldIds = new Set<string>();

  for (const field of fields) {
    if (field.type === "price") {
      const selected = formData.get(`field_${field.id}`) === "1";
      if (field.required && !selected) {
        return {
          error:
            locale === "ar"
              ? `اختر ${pickLocale(locale, field.label, field.labelAr)}.`
              : `Select ${field.label}.`,
        };
      }
      if (!selected) continue;
      if (field.priceEgp === null || field.priceEgp < 0) {
        return { error: "That add-on is not configured correctly." };
      }
      selectedPriceFieldIds.add(field.id);
      answers.push({
        fieldId: field.id,
        label: field.label,
        labelAr: field.labelAr,
        type: "price",
        textValue: formatEgp(field.priceEgp, locale),
        imageKey: null,
        priceEgp: field.priceEgp,
        sortOrder: field.sortOrder,
      });
      continue;
    }

    if (field.type === "text" || field.type === "number") {
      const textValue = String(formData.get(`field_${field.id}`) ?? "").trim();
      if (field.required && !textValue) {
        return {
          error:
            locale === "ar"
              ? `املأ ${pickLocale(locale, field.label, field.labelAr)}.`
              : `Fill in ${field.label}.`,
        };
      }
      if (!textValue) continue;
      if (field.type === "number" && !isDigitsOnly(textValue)) {
        return {
          error:
            locale === "ar"
              ? `${pickLocale(locale, field.label, field.labelAr)} يجب أن يحتوي على أرقام فقط.`
              : `${field.label} must contain numbers only.`,
        };
      }
      answers.push({
        fieldId: field.id,
        label: field.label,
        labelAr: field.labelAr,
        type: field.type,
        textValue,
        imageKey: null,
        priceEgp: null,
        sortOrder: field.sortOrder,
      });
      continue;
    }

    const file = formData.get(`field_${field.id}`);
    const hasFile = file instanceof File && file.size > 0;
    if (field.required && !hasFile) {
      return {
        error:
          locale === "ar"
            ? `ارفع ${pickLocale(locale, field.label, field.labelAr)}.`
            : `Upload ${field.label}.`,
      };
    }
    if (!hasFile || !(file instanceof File)) continue;

    try {
      const imageKey = await saveCaseImage(file);
      answers.push({
        fieldId: field.id,
        label: field.label,
        labelAr: field.labelAr,
        type: "image",
        textValue: null,
        imageKey,
        priceEgp: null,
        sortOrder: field.sortOrder,
      });
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : `Could not save ${field.label}.`,
      };
    }
  }

  const fieldDefs: CategoryFieldDef[] = fields.map((field) => ({
    id: field.id,
    label: field.label,
    labelAr: field.labelAr,
    type: field.type,
    required: field.required,
    priceEgp: field.priceEgp,
  }));
  const priceAddonEgp = sumSelectedPriceFieldAddons(
    fieldDefs,
    selectedPriceFieldIds,
  );
  const finalPriceEgp = category.priceEgp! + priceAddonEgp;

  let paymentScreenshotKey: string;

  try {
    paymentScreenshotKey = await savePaymentScreenshot(screenshot);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not save the screenshot.",
    };
  }

  try {
    const code = await db.transaction(async (tx) => {
      let orderCode = generateOrderCode();

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const [clash] = await tx
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.code, orderCode))
          .limit(1);

        if (!clash) break;
        orderCode = generateOrderCode();
      }

      const [order] = await tx
        .insert(orders)
        .values({
          code: orderCode,
          studentName: name,
          studentPhone: phone,
          studentUniversity: university.name,
          studentUniversityAr: university.nameAr,
          categoryId: category.id,
          categoryName: categoryNames.english,
          categoryNameAr: categoryNames.arabic,
          priceEgp: finalPriceEgp,
          status: "pending",
          paymentScreenshotKey,
        })
        .returning({ code: orders.code, id: orders.id });

      if (answers.length > 0) {
        await tx.insert(orderFieldValues).values(
          answers.map((answer) => ({
            orderId: order.id,
            fieldId: answer.fieldId,
            label: answer.label,
            labelAr: answer.labelAr,
            type: answer.type,
            textValue: answer.textValue,
            imageKey: answer.imageKey,
            priceEgp: answer.priceEgp,
            sortOrder: answer.sortOrder,
          })),
        );
      }

      await tx.insert(orderEvents).values({
        orderId: order.id,
        status: "pending",
        note: "Case submitted",
      });

      return order.code;
    });

    return { code };
  } catch {
    return { error: "Could not save the case. Try again." };
  }
}

export async function bulkUpdateStatus(
  orderIds: string[],
  status: OrderStatus,
) {
  const session = await requireStaffSession();
  const scope = await loadOrderScope(session.staffId);

  if (!scope) return { error: "You are not allowed to update orders." };

  if (orderIds.length === 0) {
    return { error: "Select at least one order." };
  }

  if (!statusesForRole(scope.role).includes(status)) {
    return { error: "You cannot set that status." };
  }

  const existing = await db
    .select({
      id: orders.id,
      status: orders.status,
      categoryId: orders.categoryId,
      priceEgp: orders.priceEgp,
      statsCostEgp: orders.statsCostEgp,
      statsProfitEgp: orders.statsProfitEgp,
    })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
    .where(and(inArray(orders.id, orderIds), scope.condition));

  if (existing.length !== orderIds.length) {
    return { error: "Those orders are outside your assignment." };
  }

  const toUpdate = existing.filter((order) => order.status !== status);
  if (toUpdate.length === 0) {
    return { error: "Those orders already have that status." };
  }

  const idsToUpdate = toUpdate.map((order) => order.id);

  await db.transaction(async (tx) => {
    for (const order of toUpdate) {
      await applyOrderStatusStatsTransition(tx, order, order.status, status);
    }

    await tx
      .update(orders)
      .set({
        status,
        assignedLabId: null,
        lastStatusByStaffId: session.staffId,
        updatedAt: new Date(),
      })
      .where(inArray(orders.id, idsToUpdate));

    await tx.insert(orderEvents).values(
      idsToUpdate.map((orderId) => ({
        orderId,
        status,
        staffId: session.staffId,
      })),
    );
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  return { ok: true as const };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return bulkUpdateStatus([orderId], status);
}

export async function listLabStaff() {
  const session = await requireStaffSession();
  if (session.role === "lab") return [];

  return db
    .select({ id: staff.id, name: staff.name })
    .from(staff)
    .where(and(eq(staff.role, "lab"), eq(staff.isActive, true)))
    .orderBy(asc(staff.name));
}

export async function assignOrderToLab(orderId: string, labStaffId: string) {
  const session = await requireStaffSession();
  const scope = await loadOrderScope(session.staffId);

  if (!scope || scope.role === "lab") {
    return { error: "You are not allowed to assign labs." };
  }

  if (!orderId || !labStaffId) {
    return { error: "Choose a lab." };
  }

  const [lab] = await db
    .select({ id: staff.id, name: staff.name })
    .from(staff)
    .where(
      and(
        eq(staff.id, labStaffId),
        eq(staff.role, "lab"),
        eq(staff.isActive, true),
      ),
    )
    .limit(1);

  if (!lab) return { error: "That lab account was not found." };

  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      assignedLabId: orders.assignedLabId,
      categoryId: orders.categoryId,
      priceEgp: orders.priceEgp,
      statsCostEgp: orders.statsCostEgp,
      statsProfitEgp: orders.statsProfitEgp,
    })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
    .where(and(eq(orders.id, orderId), scope.condition))
    .limit(1);

  if (!order) return { error: "That order was not found." };
  if (order.assignedLabId === lab.id && order.status === "sent_to_lab") {
    return { error: "This order is already assigned to that lab." };
  }

  const nextStatus = "sent_to_lab" as const;

  await db.transaction(async (tx) => {
    if (order.status !== nextStatus) {
      await applyOrderStatusStatsTransition(
        tx,
        order,
        order.status,
        nextStatus,
      );
    }

    await tx
      .update(orders)
      .set({
        assignedLabId: lab.id,
        status: nextStatus,
        lastStatusByStaffId: session.staffId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    await tx.insert(orderEvents).values({
      orderId: order.id,
      status: nextStatus,
      note: `Assigned to ${lab.name}`,
      staffId: session.staffId,
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/orders/${orderId}`);
  return { ok: true as const };
}

export async function deleteOrders(orderIds: string[]) {
  await requireAdminSession();

  if (orderIds.length === 0) {
    return { error: "Select at least one order." };
  }

  const imageKeys = await db.transaction(async (tx) => {
    const existing = await tx
      .select({
        id: orders.id,
        categoryId: orders.categoryId,
        priceEgp: orders.priceEgp,
        statsCostEgp: orders.statsCostEgp,
        statsProfitEgp: orders.statsProfitEgp,
        paymentScreenshotKey: orders.paymentScreenshotKey,
      })
      .from(orders)
      .where(inArray(orders.id, orderIds));

    const fieldImages = await tx
      .select({ imageKey: orderFieldValues.imageKey })
      .from(orderFieldValues)
      .where(inArray(orderFieldValues.orderId, orderIds));

    await removeOrdersFromCategoryStats(tx, existing);
    await tx.delete(orders).where(inArray(orders.id, orderIds));

    return [
      ...existing.map((order) => order.paymentScreenshotKey),
      ...fieldImages.map((field) => field.imageKey),
    ];
  });

  await deleteStoredImages(imageKeys);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  return { ok: true as const };
}

export async function listOrders(filters: {
  status?: OrderStatus | "all";
  q?: string;
  universityId?: string;
}) {
  const session = await requireStaffSession();
  const scope = await loadOrderScope(session.staffId);
  if (!scope) return [];

  const conditions = [];
  if (scope.condition) conditions.push(scope.condition);

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(orders.status, filters.status));
  }

  const universityId = filters.universityId?.trim();
  if (universityId && universityId !== "all") {
    const [university] = await db
      .select({ name: universities.name })
      .from(universities)
      .where(eq(universities.id, universityId))
      .limit(1);
    if (university) {
      conditions.push(eq(orders.studentUniversity, university.name));
    }
  }

  if (filters.q?.trim()) {
    const trimmed = filters.q.trim();
    const q = `%${trimmed}%`;
    const searchConditions = [
      ilike(orders.code, q),
      ilike(orders.studentName, q),
      ilike(orders.studentPhone, q),
      ilike(orders.studentUniversity, q),
      ilike(orders.studentUniversityAr, q),
      ilike(orders.categoryNameAr, q),
    ];
    const asNumber = Number(trimmed.replace(/^#/, ""));
    if (Number.isInteger(asNumber) && asNumber > 0) {
      searchConditions.push(eq(orders.orderNumber, asNumber));
    }
    conditions.push(or(...searchConditions));
  }

  const assignedLab = alias(staff, "assigned_lab");
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      code: orders.code,
      categoryName: orders.categoryName,
      categoryNameAr: orders.categoryNameAr,
      studentUniversityAr: orders.studentUniversityAr,
      priceEgp: orders.priceEgp,
      costEgp: categories.costEgp,
      status: orders.status,
      assignedLabName: assignedLab.name,
      createdAt: orders.createdAt,
      studentName: orders.studentName,
      studentPhone: orders.studentPhone,
      studentUniversity: orders.studentUniversity,
    })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
    .leftJoin(assignedLab, eq(orders.assignedLabId, assignedLab.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  return rows;
}

export async function getOrderDetail(orderId: string) {
  const session = await requireStaffSession();
  const scope = await loadOrderScope(session.staffId);
  if (!scope) return null;

  const [visible] = await db
    .select({ id: orders.id })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
    .where(and(eq(orders.id, orderId), scope.condition))
    .limit(1);

  if (!visible) return null;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      assignedLab: {
        columns: { id: true, name: true },
      },
      events: {
        with: {
          staff: {
            columns: { id: true, name: true },
          },
        },
      },
      fieldValues: true,
    },
  });

  return order ?? null;
}

async function resolveCategoryContext(categoryId: string | null) {
  if (!categoryId) {
    return { categoryRecord: null, parentRecord: null };
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  if (!category) {
    return { categoryRecord: null, parentRecord: null };
  }

  let parentRecord: CategoryRecord | null = null;
  if (category.parentId) {
    const [parent] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, category.parentId))
      .limit(1);
    parentRecord = parent ? (parent as CategoryRecord) : null;
  }

  return {
    categoryRecord: category as CategoryRecord,
    parentRecord,
  };
}

export async function findPublicOrder(code: string) {
  const normalized = code.trim().toUpperCase();

  if (!normalized) return null;

  const order = await db.query.orders.findFirst({
    where: eq(orders.code, normalized),
    with: {
      assignedLab: {
        columns: { name: true },
      },
    },
  });

  if (!order) return null;

  const { categoryRecord, parentRecord } = await resolveCategoryContext(
    order.categoryId,
  );

  return { ...order, categoryRecord, parentRecord };
}
