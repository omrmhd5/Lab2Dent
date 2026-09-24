import { OrdersExportButton } from "@/components/admin/orders-export-button";
import { SubmitButton } from "@/components/submit-button";
import { OrdersTable } from "@/components/admin/orders-table";
import { SelectMenu } from "@/components/select-menu";
import type { OrderStatus } from "@/db/schema";
import { pickLocale } from "@/lib/bilingual";
import { getDash } from "@/i18n/dashboard";
import { requireStaffSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { ORDER_STATUSES, STATUS_LABELS, statusesForRole } from "@/lib/status";
import { listOrders } from "@/server/actions/orders";
import { listUniversities } from "@/server/actions/universities";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; university?: string }>;
}) {
  const [session, locale] = await Promise.all([
    requireStaffSession(),
    getLocale(),
  ]);
  const t = getDash(locale);
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
      <h1 className="text-3xl font-bold tracking-tight">{t.orders}</h1>
      <form className="ui-card mt-6 flex flex-wrap gap-3">
        <input
          className="ui-input max-w-xs"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t.searchOrders}
        />
        {isLab ? null : (
          <SelectMenu
            name="university"
            className="w-72 shrink-0"
            defaultValue={selectedUniversity}
            ariaLabel={t.filterUniversity}
            options={[
              { value: "all", label: t.allUniversities },
              ...universities.map((row) => ({
                value: row.id,
                label: pickLocale(locale, row.name, row.nameAr),
              })),
            ]}
          />
        )}
        <SelectMenu
          name="status"
          className="w-72 shrink-0"
          defaultValue={selectedStatus}
          ariaLabel={t.filterStatus}
          options={[
            { value: "all", label: t.allStatuses },
            ...statusOptions.map((value) => ({
              value,
              label: STATUS_LABELS[value][locale],
            })),
          ]}
        />
        <SubmitButton className="ui-press ui-btn ui-btn-primary">{t.filter}</SubmitButton>
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
