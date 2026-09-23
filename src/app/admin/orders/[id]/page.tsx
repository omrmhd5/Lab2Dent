import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { OrderDeleteButton } from "@/components/admin/order-delete-button";
import {
  OrderCaseDetailsCard,
  OrderHistoryCard,
  OrderPaymentCard,
  OrderStatusPill,
  OrderStatusCard,
  OrderStudentCard,
  OrderWorkCard,
} from "@/components/admin/order-detail-sections";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getOrderDetail } from "@/server/actions/orders";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) notFound();

  let costEgp: number | null = null;
  if (order.categoryId) {
    const [category] = await db
      .select({ costEgp: categories.costEgp })
      .from(categories)
      .where(eq(categories.id, order.categoryId))
      .limit(1);
    costEgp = category?.costEgp ?? null;
  }

  const events = [...order.events].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const submittedAt = order.createdAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="text-sm text-muted">
              Back to orders
            </Link>
            <OrderDeleteButton orderId={order.id} orderCode={order.code} />
          </div>
          <h1 className="mt-2 font-mono text-2xl tracking-tight md:text-3xl">
            <span className="text-muted">#{order.orderNumber}</span>{" "}
            {order.code}
          </h1>
          <p className="mt-2 text-sm text-muted">Submitted {submittedAt}</p>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OrderStudentCard
          name={order.studentName}
          phone={order.studentPhone}
          university={order.studentUniversity}
        />
        <OrderWorkCard
          categoryName={order.categoryName}
          priceEgp={order.priceEgp}
          costEgp={costEgp}
        />
        <OrderStatusCard orderId={order.id} status={order.status} />
      </div>

      <OrderCaseDetailsCard
        orderId={order.id}
        legacy={{
          shade: order.shade,
          toothNotes: order.toothNotes,
          extraNotes: order.extraNotes,
        }}
        fields={order.fieldValues.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          textValue: field.textValue,
          imageKey: field.imageKey,
          sortOrder: field.sortOrder,
        }))}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <OrderPaymentCard orderId={order.id} />
        <OrderHistoryCard
          events={events.map((event) => ({
            id: event.id,
            status: event.status,
            createdAt: event.createdAt,
            staff: event.staff,
          }))}
        />
      </div>
    </div>
  );
}
