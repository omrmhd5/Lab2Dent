"use client";

import { FileXls } from "@phosphor-icons/react";
import type { StaffRole } from "@/db/schema";
import {
  downloadOrdersWorkbook,
  type ExportableOrder,
} from "@/components/admin/orders-workbook";

export function OrdersExportButton({
  orders,
  role,
}: {
  orders: ExportableOrder[];
  role: StaffRole;
}) {
  return (
    <button
      type="button"
      className="ui-press ui-btn ui-btn-sm ui-btn-secondary grid size-11 shrink-0 place-items-center"
      style={{ padding: 0 }}
      disabled={orders.length === 0}
      aria-label="Export to Excel"
      title="Export to Excel"
      onClick={() => downloadOrdersWorkbook(orders, role)}>
      <FileXls size={22} weight="bold" aria-hidden="true" />
    </button>
  );
}
