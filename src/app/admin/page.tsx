import { OrdersTable } from "@/components/admin/orders-table";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/status";
import { listOrders } from "@/server/actions/orders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const selectedStatus =
    status && ORDER_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "all";

  const orders = await listOrders({
    status: selectedStatus,
    q,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <form className="mt-6 flex flex-wrap gap-3">
        <input
          className="ui-input max-w-xs"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, phone, or code"
        />
        <select className="ui-input max-w-52" name="status" defaultValue={selectedStatus}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value].en}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="ui-press rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>
      <div className="mt-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
