import { OrdersTable } from "@/components/admin/orders-table";
import { SelectMenu } from "@/components/select-menu";
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
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      <form className="ui-card mt-6 flex flex-wrap gap-3">
        <input
          className="ui-input max-w-xs"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, phone, code, or #"
        />
        <SelectMenu
          name="status"
          className="w-72 shrink-0"
          defaultValue={selectedStatus}
          ariaLabel="Filter by status"
          options={[
            { value: "all", label: "All statuses" },
            ...ORDER_STATUSES.map((value) => ({
              value,
              label: STATUS_LABELS[value].en,
            })),
          ]}
        />
        <button
          type="submit"
          className="ui-press ui-btn ui-btn-primary"
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
