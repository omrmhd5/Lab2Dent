import type { ReactNode } from "react";
import { getDash } from "@/i18n/dashboard";
import { getLocale } from "@/lib/locale";
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

export async function OrderStudentCard({
  name,
  phone,
  university,
}: {
  name: string;
  phone: string;
  university: string;
}) {
  const t = getDash(await getLocale());
  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">{t.studentCard}</h2>
      <dl className="mt-2 divide-y divide-border">
        <DetailRow label={t.name} value={name} />
        <DetailRow label={t.phone} value={phone} mono />
        <DetailRow label={t.university} value={university} />
      </dl>
    </section>
  );
}

export async function OrderWorkCard({
  categoryName,
  priceEgp,
  basePriceEgp,
  addOns,
  costEgp,
  showPrice,
  showMoney,
}: {
  categoryName: string;
  priceEgp: number;
  basePriceEgp: number;
  addOns: { id: string; label: string; priceEgp: number }[];
  costEgp: number | null;
  showPrice: boolean;
  showMoney: boolean;
}) {
  const locale = await getLocale();
  const t = getDash(locale);
  const profit = costEgp === null ? null : priceEgp - costEgp;
  const hasBreakdown = addOns.length > 0;

  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">{t.work}</h2>
      <dl className="mt-2 divide-y divide-border">
        <DetailRow label={t.service} value={categoryName} />
        {showPrice ? (
          hasBreakdown ? (
            <div className="py-3">
              <p className="text-sm font-bold">{t.price}</p>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{t.basePrice}</dt>
                  <dd className="font-mono font-bold">
                    {formatEgp(basePriceEgp, locale)}
                  </dd>
                </div>
                {addOns.map((addOn) => (
                  <div
                    key={addOn.id}
                    className="flex items-center justify-between gap-4">
                    <dt className="min-w-0 text-muted">{addOn.label}</dt>
                    <dd className="shrink-0 font-mono font-bold">
                      +{formatEgp(addOn.priceEgp, locale)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                  <dt className="font-bold">{t.total}</dt>
                  <dd className="font-mono font-bold">
                    {formatEgp(priceEgp, locale)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <DetailRow
              label={t.price}
              value={formatEgp(priceEgp, locale)}
              mono
            />
          )
        ) : null}
        {showMoney ? (
          <DetailRow
            label={t.cost}
            value={costEgp === null ? "—" : formatEgp(costEgp, locale)}
            mono
          />
        ) : null}
        {showMoney ? (
          <DetailRow
            label={t.profit}
            value={profit === null ? "—" : formatEgp(profit, locale)}
            mono
          />
        ) : null}
      </dl>
    </section>
  );
}

export async function OrderStatusCard({
  orderId,
  status,
  allowedStatuses,
}: {
  orderId: string;
  status: OrderStatus;
  allowedStatuses: OrderStatus[];
}) {
  const t = getDash(await getLocale());
  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">{t.updateStatus}</h2>
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

export async function OrderCaseDetailsCard({
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
    type: "text" | "number" | "image" | "price";
    textValue: string | null;
    imageKey: string | null;
    priceEgp: number | null;
    sortOrder: number;
  }[];
}) {
  const t = getDash(await getLocale());
  const sortedFields = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasLegacy = Boolean(
    legacy.shade || legacy.toothNotes || legacy.extraNotes,
  );
  const hasFields = sortedFields.length > 0;

  if (!hasLegacy && !hasFields) return null;

  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">{t.caseDetails}</h2>
      <div className="mt-4 space-y-4">
        {hasLegacy ? (
          <dl className="divide-y divide-border rounded-2xl border border-border px-4">
            {legacy.shade ? (
              <DetailRow label={t.shade} value={legacy.shade} />
            ) : null}
            {legacy.toothNotes ? (
              <DetailRow label={t.teeth} value={legacy.toothNotes} />
            ) : null}
            {legacy.extraNotes ? (
              <DetailRow label={t.labNotes} value={legacy.extraNotes} />
            ) : null}
          </dl>
        ) : null}

        {sortedFields.map((field) =>
          field.type === "price" && field.priceEgp !== null ? (
            <div
              key={field.id}
              className="rounded-2xl border border-border px-4 py-3">
              <p className="text-sm text-muted">{field.label}</p>
              <p className="mt-1 font-mono text-sm font-bold">
                +{formatEgp(field.priceEgp)}
              </p>
            </div>
          ) : field.type === "image" && field.imageKey ? (
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
          ) : (field.type === "text" || field.type === "number") &&
            field.textValue?.trim() ? (
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

export async function OrderPaymentCard({ orderId }: { orderId: string }) {
  const t = getDash(await getLocale());
  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">{t.payment}</h2>
      <p className="mt-1 text-sm text-muted">{t.paymentHint}</p>
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

export async function OrderHistoryCard({
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
  const t = getDash(await getLocale());
  if (events.length === 0) return null;

  return (
    <section className="ui-card">
      <h2 className="text-sm font-bold">{t.history}</h2>
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
              locale={t.locale}
              className="px-2.5 py-1 text-xs"
            />
            <p className="mt-0.5 text-sm text-muted">
              {formatDateTime(event.createdAt, t.locale)}
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
