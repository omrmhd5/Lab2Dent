import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { OrderAssignLabCard } from "@/components/admin/order-assign-lab";
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
import { pickLocale } from "@/lib/bilingual";
import { getDash } from "@/i18n/dashboard";
import { requireStaffSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { statusesForRole } from "@/lib/status";
import { formatDateTime } from "@/lib/utils";
import { getOrderDetail, listLabStaff } from "@/server/actions/orders";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, locale] = await Promise.all([
    requireStaffSession(),
    getLocale(),
  ]);
  const t = getDash(locale);
  const [order, labs] = await Promise.all([
    getOrderDetail(id),
    session.role !== "lab" ? listLabStaff() : Promise.resolve([]),
  ]);
  const showPrice = session.role !== "lab";
  const showMoney = session.role === "admin";

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

  const submittedAt = formatDateTime(order.createdAt, locale);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="text-sm text-muted">
              {t.orders}
            </Link>
            {session.role === "admin" ? (
              <OrderDeleteButton orderId={order.id} orderCode={order.code} />
            ) : null}
          </div>
          <h1 className="mt-2 font-mono text-2xl tracking-tight md:text-3xl">
            <span className="text-muted">#{order.orderNumber}</span>{" "}
            {order.code}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t.submitted} {submittedAt}
          </p>
        </div>
        <OrderStatusPill
          status={order.status}
          labName={order.assignedLab?.name}
          locale={locale}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <OrderStudentCard
          name={order.studentName}
          phone={order.studentPhone}
          university={pickLocale(
            locale,
            order.studentUniversity,
            order.studentUniversityAr,
          )}
        />
        <OrderWorkCard
          categoryName={pickLocale(
            locale,
            order.categoryName,
            order.categoryNameAr,
          )}
          priceEgp={order.priceEgp}
          costEgp={costEgp}
          showPrice={showPrice}
          showMoney={showMoney}
        />
        <OrderStatusCard
          orderId={order.id}
          status={order.status}
          allowedStatuses={statusesForRole(session.role)}
        />
        {session.role !== "lab" ? (
          <OrderAssignLabCard
            orderId={order.id}
            assignedLabId={order.assignedLabId}
            labs={labs}
          />
        ) : null}
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
          label: pickLocale(locale, field.label, field.labelAr),
          type: field.type,
          textValue: field.textValue,
          imageKey: field.imageKey,
          sortOrder: field.sortOrder,
        }))}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {session.role === "lab" ? null : (
          <OrderPaymentCard orderId={order.id} />
        )}
        <OrderHistoryCard
          events={events.map((event) => ({
            id: event.id,
            status: event.status,
            note: event.note,
            createdAt: event.createdAt,
            staff: event.staff,
          }))}
        />
      </div>
    </div>
  );
}
