import { eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { categories, orders, type OrderStatus } from "@/db/schema";

const PAYMENT_CONFIRMED_STATUSES = new Set<OrderStatus>([
  "confirmed",
  "sent_to_lab",
  "in_lab",
  "ready",
  "delivered",
]);

export function isPaymentConfirmed(status: OrderStatus) {
  return PAYMENT_CONFIRMED_STATUSES.has(status);
}

type StatsOrder = {
  id: string;
  categoryId: string | null;
  priceEgp: number;
  statsCostEgp: number | null;
  statsProfitEgp: number | null;
};

async function resolveGroupId(
  tx: Database,
  categoryId: string | null,
): Promise<string | null> {
  if (!categoryId) return null;

  const [subcategory] = await tx
    .select({ parentId: categories.parentId })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  return subcategory?.parentId ?? null;
}

async function addOrderToCategoryStats(tx: Database, order: StatsOrder) {
  if (!order.categoryId) return;

  const [subcategory] = await tx
    .select({
      parentId: categories.parentId,
      costEgp: categories.costEgp,
    })
    .from(categories)
    .where(eq(categories.id, order.categoryId))
    .limit(1);

  if (!subcategory?.parentId) return;

  const cost = subcategory.costEgp ?? 0;
  const profit = order.priceEgp - cost;

  await tx
    .update(categories)
    .set({
      confirmedOrderCount: sql`${categories.confirmedOrderCount} + 1`,
      confirmedTotalPriceEgp: sql`${categories.confirmedTotalPriceEgp} + ${order.priceEgp}`,
      confirmedTotalCostEgp: sql`${categories.confirmedTotalCostEgp} + ${cost}`,
      confirmedTotalProfitEgp: sql`${categories.confirmedTotalProfitEgp} + ${profit}`,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, subcategory.parentId));

  await tx
    .update(orders)
    .set({
      statsCostEgp: cost,
      statsProfitEgp: profit,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));
}

export async function removeOrderFromCategoryStats(
  tx: Database,
  order: StatsOrder,
) {
  if (order.statsCostEgp === null || order.statsProfitEgp === null) {
    return;
  }

  const groupId = await resolveGroupId(tx, order.categoryId);

  if (groupId) {
    await tx
      .update(categories)
      .set({
        confirmedOrderCount: sql`${categories.confirmedOrderCount} - 1`,
        confirmedTotalPriceEgp: sql`${categories.confirmedTotalPriceEgp} - ${order.priceEgp}`,
        confirmedTotalCostEgp: sql`${categories.confirmedTotalCostEgp} - ${order.statsCostEgp}`,
        confirmedTotalProfitEgp: sql`${categories.confirmedTotalProfitEgp} - ${order.statsProfitEgp}`,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, groupId));
  }

  await tx
    .update(orders)
    .set({
      statsCostEgp: null,
      statsProfitEgp: null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));
}

export async function applyOrderStatusStatsTransition(
  tx: Database,
  order: StatsOrder,
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
) {
  const wasConfirmed = isPaymentConfirmed(fromStatus);
  const isConfirmed = isPaymentConfirmed(toStatus);

  if (!wasConfirmed && isConfirmed) {
    await addOrderToCategoryStats(tx, order);
    return;
  }

  if (wasConfirmed && !isConfirmed) {
    await removeOrderFromCategoryStats(tx, order);
  }
}

export async function removeOrdersFromCategoryStats(
  tx: Database,
  orderRows: StatsOrder[],
) {
  for (const order of orderRows) {
    await removeOrderFromCategoryStats(tx, order);
  }
}
