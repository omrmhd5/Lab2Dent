import type { ReactNode } from "react";
import type { OrderStatus } from "@/db/schema";
import { statusDotClass } from "@/lib/status";
import { OrderStatusPill } from "@/components/admin/status-pill";
import { formatDateTime, formatEgp } from "@/lib/utils";

export { OrderStatusPill };
import { OrderStatusForm } from "@/components/admin/order-status-form";

export function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className={`text-end text-sm font-bold ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export function OrderStudentCard({
  name,
  phone,
  university,
}: {
  name: string;
  phone: string;
  university: string;
}) {
  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">Student</h2>
      <dl className="mt-2 divide-y divide-border">
        <DetailRow label="Name" value={name} />
        <DetailRow label="Phone" value={phone} mono />
        <DetailRow label="University" value={university} />
      </dl>
    </section>
  );
}

export function OrderWorkCard({
  categoryName,
  priceEgp,
  costEgp,
  showPrice,
  showMoney,
}: {
  categoryName: string;
  priceEgp: number;
  costEgp: number | null;
  showPrice: boolean;
  showMoney: boolean;
}) {
  const profit = costEgp === null ? null : priceEgp - costEgp;

  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">Work</h2>
      <dl className="mt-2 divide-y divide-border">
        <DetailRow label="Service" value={categoryName} />
        {showPrice ? (
          <DetailRow label="Price" value={formatEgp(priceEgp)} mono />
        ) : null}
        {showMoney ? (
          <DetailRow
            label="Cost"
            value={costEgp === null ? "—" : formatEgp(costEgp)}
            mono
          />
        ) : null}
        {showMoney ? (
          <DetailRow
            label="Profit"
            value={profit === null ? "—" : formatEgp(profit)}
            mono
          />
        ) : null}
      </dl>
    </section>
  );
}

export function OrderStatusCard({
  orderId,
  status,
  allowedStatuses,
}: {
  orderId: string;
  status: OrderStatus;
  allowedStatuses: OrderStatus[];
}) {
  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">Update status</h2>
      <div className="mt-3">
        <OrderStatusForm
          orderId={orderId}
          status={status}
          allowedStatuses={allowedStatuses}
        />
      </div>
    </section>
  );
}

export function OrderCaseDetailsCard({
  orderId,
  legacy,
  fields,
}: {
  orderId: string;
  legacy: {
    shade: string | null;
    toothNotes: string | null;
    extraNotes: string | null;
  };
  fields: {
    id: string;
    label: string;
    type: "text" | "image";
    textValue: string | null;
    imageKey: string | null;
    sortOrder: number;
  }[];
}) {
  const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasLegacy = Boolean(
    legacy.shade || legacy.toothNotes || legacy.extraNotes,
  );
  const hasFields = sortedFields.length > 0;

  if (!hasLegacy && !hasFields) return null;

  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">Case details</h2>
      <div className="mt-4 space-y-4">
        {hasLegacy ? (
          <dl className="divide-y divide-border rounded-2xl border border-border px-4">
            {legacy.shade ? (
              <DetailRow label="Shade" value={legacy.shade} />
            ) : null}
            {legacy.toothNotes ? (
              <DetailRow label="Teeth / details" value={legacy.toothNotes} />
            ) : null}
            {legacy.extraNotes ? (
              <DetailRow label="Lab notes" value={legacy.extraNotes} />
            ) : null}
          </dl>
        ) : null}

        {sortedFields.map((field) =>
          field.type === "image" && field.imageKey ? (
            <div
              key={field.id}
              className="overflow-hidden rounded-2xl border border-border">
              <p className="border-b border-border bg-brand-soft px-4 py-2 text-sm font-bold">
                {field.label}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/orders/${orderId}/fields/${field.id}`}
                alt={field.label}
                className="max-h-80 w-full bg-surface object-contain"
              />
            </div>
          ) : field.textValue?.trim() ? (
            <div
              key={field.id}
              className="rounded-2xl border border-border px-4 py-3">
              <p className="text-sm text-muted">{field.label}</p>
              <p className="mt-1 text-sm font-bold">{field.textValue}</p>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}

export function OrderPaymentCard({ orderId }: { orderId: string }) {
  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">Instapay screenshot</h2>
      <p className="mt-1 text-sm text-muted">
        Payment proof uploaded with this case.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-brand-soft/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/orders/${orderId}/payment`}
          alt="Instapay transfer screenshot"
          className="max-h-[480px] w-full object-contain"
        />
      </div>
    </section>
  );
}

export function OrderHistoryCard({
  events,
}: {
  events: {
    id: string;
    status: OrderStatus;
    note: string | null;
    createdAt: Date;
    staff: { name: string } | null;
  }[];
}) {
  if (events.length === 0) return null;

  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">History</h2>
      <ol className="relative mt-4 space-y-0 border-s border-border ps-5">
        {events.map((event, index) => (
          <li key={event.id} className="relative pb-6 ps-1 last:pb-0">
            <span
              className={`absolute -start-[calc(1.25rem+1px)] top-1.5 size-2.5 -translate-x-1/2 rounded-full ring-4 ring-surface ${statusDotClass(event.status)}`}
              aria-hidden="true"
            />
            <OrderStatusPill
              status={event.status}
              labName={
                event.note?.startsWith("Assigned to ")
                  ? event.note.slice("Assigned to ".length)
                  : null
              }
              className="px-2.5 py-1 text-xs"
            />
            <p className="mt-0.5 text-sm text-muted">
              {formatDateTime(event.createdAt)}
              {event.staff?.name ? ` · ${event.staff.name}` : ""}
            </p>
            {index === 0 ? (
              <span className="mt-1 inline-block text-xs font-bold text-accent">
                Latest
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
