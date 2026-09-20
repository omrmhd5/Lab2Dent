"use server";

import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  customers,
  orderEvents,
  orders,
  type OrderStatus,
} from "@/db/schema";
import { requireStaffSession } from "@/lib/auth";
import { generateOrderCode } from "@/lib/order-code";
import { savePaymentScreenshot } from "@/lib/storage";
import { ORDER_STATUSES } from "@/lib/status";
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
  const university = String(formData.get("university") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const shade = String(formData.get("shade") ?? "").trim() || null;
  const toothNotes = String(formData.get("toothNotes") ?? "").trim() || null;
  const extraNotes = String(formData.get("extraNotes") ?? "").trim() || null;
  const screenshot = formData.get("screenshot");

  if (!name || !phone || !university || !categoryId) {
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

  if (!category) {
    return { error: "That service is no longer available." };
  }

  let paymentScreenshotKey: string;

  try {
    paymentScreenshotKey = await savePaymentScreenshot(screenshot);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the screenshot.",
    };
  }

  try {
    const code = await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(customers)
        .where(eq(customers.phone, phone))
        .limit(1);

      let customerId = existing?.id;

      if (existing) {
        await tx
          .update(customers)
          .set({
            name,
            university,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, existing.id));
      } else {
        const [created] = await tx
          .insert(customers)
          .values({ name, phone, university })
          .returning({ id: customers.id });
        customerId = created.id;
      }

      if (!customerId) {
        throw new Error("Could not save customer.");
      }

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
          customerId,
          categoryId: category.id,
          categoryName: category.name,
          priceEgp: category.priceEgp,
          shade,
          toothNotes,
          extraNotes,
          status: "pending",
          paymentScreenshotKey,
        })
        .returning({ code: orders.code, id: orders.id });

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

export async function bulkUpdateStatus(orderIds: string[], status: OrderStatus) {
  const session = await requireStaffSession();

  if (orderIds.length === 0) {
    return { error: "Select at least one order." };
  }

  if (!ORDER_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status,
        lastStatusByStaffId: session.staffId,
        updatedAt: new Date(),
      })
      .where(inArray(orders.id, orderIds));

    await tx.insert(orderEvents).values(
      orderIds.map((orderId) => ({
        orderId,
        status,
        staffId: session.staffId,
      })),
    );
  });

  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  return { ok: true as const };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return bulkUpdateStatus([orderId], status);
}

export async function listOrders(filters: {
  status?: OrderStatus | "all";
  q?: string;
}) {
  await requireStaffSession();

  const conditions = [];

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(orders.status, filters.status));
  }

  if (filters.q?.trim()) {
    const q = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(orders.code, q),
        ilike(customers.name, q),
        ilike(customers.phone, q),
        ilike(customers.university, q),
      ),
    );
  }

  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      categoryName: orders.categoryName,
      priceEgp: orders.priceEgp,
      status: orders.status,
      createdAt: orders.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  return rows;
}

export async function getOrderDetail(orderId: string) {
  await requireStaffSession();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      customer: true,
      events: {
        with: {
          staff: {
            columns: { id: true, name: true },
          },
        },
      },
    },
  });

  return order ?? null;
}

export async function findPublicOrder(code: string) {
  const normalized = code.trim().toUpperCase();

  if (!normalized) return null;

  const order = await db.query.orders.findFirst({
    where: eq(orders.code, normalized),
    with: {
      customer: {
        columns: { name: true },
      },
    },
  });

  return order ?? null;
}
