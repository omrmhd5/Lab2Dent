"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/status";
import { updateOrderStatus } from "@/server/actions/orders";

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = String(form.get("status")) as OrderStatus;
        start(async () => {
          await updateOrderStatus(orderId, next);
        });
      }}
    >
      <label className="space-y-2">
        <span className="block text-sm font-medium">Status</span>
        <select className="ui-input min-w-56" name="status" defaultValue={status}>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value].en}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="ui-press rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        Save status
      </button>
    </form>
  );
}
