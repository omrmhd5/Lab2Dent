"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/status";
import { updateOrderStatus } from "@/server/actions/orders";
import { SelectMenu } from "@/components/select-menu";

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
        <SelectMenu
          name="status"
          defaultValue={status}
          className="min-w-56"
          ariaLabel="Status"
          options={ORDER_STATUSES.map((value) => ({
            value,
            label: STATUS_LABELS[value].en,
          }))}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary"
      >
        Save status
      </button>
    </form>
  );
}
