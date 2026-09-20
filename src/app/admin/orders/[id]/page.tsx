import Link from "next/link";
import { notFound } from "next/navigation";
import { STATUS_LABELS } from "@/lib/status";
import { formatEgp } from "@/lib/utils";
import { getOrderDetail } from "@/server/actions/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) notFound();

  const events = [...order.events].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-muted">
          Back to orders
        </Link>
        <h1 className="mt-2 font-mono text-2xl tracking-tight">{order.code}</h1>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-medium">Student</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>{order.customer.name}</div>
            <div>{order.customer.phone}</div>
            <div>{order.customer.university}</div>
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-medium">Case</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>{order.categoryName}</div>
            <div className="font-mono">{formatEgp(order.priceEgp)}</div>
            {order.shade ? <div>Shade: {order.shade}</div> : null}
            {order.toothNotes ? <div>{order.toothNotes}</div> : null}
            {order.extraNotes ? <div>{order.extraNotes}</div> : null}
          </dl>
        </div>
      </section>

      <OrderStatusForm orderId={order.id} status={order.status} />

      <section>
        <h2 className="font-medium">Instapay screenshot</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/orders/${order.id}/payment`}
          alt="Instapay transfer screenshot"
          className="mt-4 max-h-[480px] rounded-2xl border border-border"
        />
      </section>

      <section>
        <h2 className="font-medium">History</h2>
        <ol className="mt-4 space-y-3">
          {events.map((event) => (
            <li key={event.id} className="text-sm">
              <span className="font-medium">{STATUS_LABELS[event.status].en}</span>
              <span className="text-muted">
                {" "}
                {event.createdAt.toLocaleString("en-GB")}
                {event.staff?.name ? ` by ${event.staff.name}` : ""}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
