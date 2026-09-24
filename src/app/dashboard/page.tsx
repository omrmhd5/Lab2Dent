import { OrdersExportButton } from "@/components/admin/orders-export-button";
import { SubmitButton } from "@/components/submit-button";
import { OrdersTable } from "@/components/admin/orders-table";
import { SelectMenu } from "@/components/select-menu";
import type { OrderStatus } from "@/db/schema";
import { requireStaffSession } from "@/lib/auth";
import { ORDER_STATUSES, STATUS_LABELS, statusesForRole } from "@/lib/status";
import { listOrders } from "@/server/actions/orders";
import { listUniversities } from "@/server/actions/universities";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; university?: string }>;
}) {
  const session = await requireStaffSession();
  const { status, q, university } = await searchParams;
  const selectedStatus =
    status && ORDER_STATUSES.includes(status as OrderStatus)
      ? (status as OrderStatus)
      : "all";
  const selectedUniversity = university?.trim() || "all";

  const isLab = session.role === "lab";
  const statusOptions = ORDER_STATUSES;

  const [orders, universities] = await Promise.all([
    listOrders({
      status: selectedStatus,
      q,
      universityId: isLab ? "all" : selectedUniversity,
    }),
    isLab ? Promise.resolve([]) : listUniversities(true),
  ]);

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
        {isLab ? null : (
          <SelectMenu
            name="university"
            className="w-72 shrink-0"
            defaultValue={selectedUniversity}
            ariaLabel="Filter by university"
            options={[
              { value: "all", label: "All universities" },
              ...universities.map((row) => ({
                value: row.id,
                label: row.name,
              })),
            ]}
          />
        )}
        <SelectMenu
          name="status"
          className="w-72 shrink-0"
          defaultValue={selectedStatus}
          ariaLabel="Filter by status"
          options={[
            { value: "all", label: "All statuses" },
            ...statusOptions.map((value) => ({
              value,
              label: STATUS_LABELS[value].en,
            })),
          ]}
        />
        <SubmitButton className="ui-press ui-btn ui-btn-primary">Filter</SubmitButton>
        <OrdersExportButton orders={orders} role={session.role} />
      </form>
      <div className="mt-6">
        <OrdersTable
          orders={orders}
          role={session.role}
          allowedStatuses={statusesForRole(session.role)}
        />
      </div>
    </div>
  );
}
