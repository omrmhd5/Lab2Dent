"use server";

import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  categoryFields,
  orderEvents,
  orderFieldValues,
  orders,
  universities,
  type OrderStatus,
} from "@/db/schema";
import { requireAdminSession, requireStaffSession } from "@/lib/auth";
import { loadOrderScope } from "@/lib/order-scope";
import { generateOrderCode } from "@/lib/order-code";
import {
  deleteStoredImages,
  saveCaseImage,
  savePaymentScreenshot,
} from "@/lib/storage";
import {
  formatCategoryLabel,
  isSelectableCategory,
  type CategoryRecord,
} from "@/lib/categories";
import {
  applyOrderStatusStatsTransition,
  removeOrdersFromCategoryStats,
} from "@/lib/category-stats";
import { statusesForRole } from "@/lib/status";
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

  const categoryName = formatCategoryLabel(category as CategoryRecord, parent);

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
    type: "text" | "image";
    textValue: string | null;
    imageKey: string | null;
    sortOrder: number;
  }[] = [];

  for (const field of fields) {
    if (field.type === "text") {
      const textValue = String(formData.get(`field_${field.id}`) ?? "").trim();
      if (field.required && !textValue) {
        return { error: `Fill in ${field.label}.` };
      }
      if (!textValue) continue;
      answers.push({
        fieldId: field.id,
        label: field.label,
        type: "text",
        textValue,
        imageKey: null,
        sortOrder: field.sortOrder,
      });
      continue;
    }

    const file = formData.get(`field_${field.id}`);
    const hasFile = file instanceof File && file.size > 0;
    if (field.required && !hasFile) {
      return { error: `Upload ${field.label}.` };
    }
    if (!hasFile || !(file instanceof File)) continue;

    try {
      const imageKey = await saveCaseImage(file);
      answers.push({
        fieldId: field.id,
        label: field.label,
        type: "image",
        textValue: null,
        imageKey,
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
          categoryId: category.id,
          categoryName,
          priceEgp: category.priceEgp!,
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
            type: answer.type,
            textValue: answer.textValue,
            imageKey: answer.imageKey,
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
    ];
    const asNumber = Number(trimmed.replace(/^#/, ""));
    if (Number.isInteger(asNumber) && asNumber > 0) {
      searchConditions.push(eq(orders.orderNumber, asNumber));
    }
    conditions.push(or(...searchConditions));
  }

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      code: orders.code,
      categoryName: orders.categoryName,
      priceEgp: orders.priceEgp,
      costEgp: categories.costEgp,
      status: orders.status,
      createdAt: orders.createdAt,
      studentName: orders.studentName,
      studentPhone: orders.studentPhone,
      studentUniversity: orders.studentUniversity,
    })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
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

export async function findPublicOrder(code: string) {
  const normalized = code.trim().toUpperCase();

  if (!normalized) return null;

  const order = await db.query.orders.findFirst({
    where: eq(orders.code, normalized),
  });

  return order ?? null;
}
