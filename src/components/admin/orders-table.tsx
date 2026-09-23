"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/status";
import { formatEgp } from "@/lib/utils";
import { bulkUpdateStatus } from "@/server/actions/orders";
import { SelectMenu } from "@/components/select-menu";

export type OrderRow = {
  id: string;
  orderNumber: number;
  code: string;
  categoryName: string;
  priceEgp: number;
  costEgp: number | null;
  status: OrderStatus;
  createdAt: Date | string;
  studentName: string;
  studentPhone: string;
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<OrderStatus>("confirmed");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => orders.map((order) => order.id), [orders]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : allIds)}
                  aria-label="Select all orders"
                />
              </th>
              <th className="px-3 py-3 font-medium">No.</th>
              <th className="px-3 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Student</th>
              <th className="px-3 py-3 font-medium">Work</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Cost</th>
              <th className="px-3 py-3 font-medium">Profit</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(order.id)}
                    onChange={() => toggle(order.id)}
                    aria-label={`Select ${order.code}`}
                  />
                </td>
                <td className="px-3 py-3 font-mono text-muted">
                  #{order.orderNumber}
                </td>
                <td className="px-3 py-3 font-mono">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-accent">
                    {order.code}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <div>{order.studentName}</div>
                  <div className="text-muted">{order.studentPhone}</div>
                </td>
                <td className="px-3 py-3">{order.categoryName}</td>
                <td className="px-3 py-3 font-mono">
                  {formatEgp(order.priceEgp)}
                </td>
                <td className="px-3 py-3 font-mono text-muted">
                  {order.costEgp === null ? "—" : formatEgp(order.costEgp)}
                </td>
                <td className="px-3 py-3 font-mono">
                  {order.costEgp === null
                    ? "—"
                    : formatEgp(order.priceEgp - order.costEgp)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      order.status === "rejected"
                        ? "bg-danger/10 text-danger"
                        : order.status === "delivered" ||
                            order.status === "ready"
                          ? "bg-accent-soft text-accent"
                          : "bg-brand-soft text-brand"
                    }`}>
                    {STATUS_LABELS[order.status].en}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="px-4 py-10 text-sm text-muted">No orders yet.</p>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div className="sticky bottom-4 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-md)]">
          <p className="text-sm">{selected.length} selected</p>
          <SelectMenu
            className="w-72 shrink-0"
            menuPlacement="up"
            ariaLabel="Bulk status"
            value={status}
            onChange={(next) => setStatus(next as OrderStatus)}
            options={ORDER_STATUSES.map((value) => ({
              value,
              label: STATUS_LABELS[value].en,
            }))}
          />
          <button
            type="button"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary"
            onClick={() => {
              start(async () => {
                const result = await bulkUpdateStatus(selected, status);
                if ("error" in result && result.error) {
                  setError(result.error);
                  return;
                }
                setSelected([]);
                setError(null);
              });
            }}>
            Update status
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
