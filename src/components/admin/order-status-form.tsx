"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = String(form.get("status")) as OrderStatus;
        start(async () => {
          await updateOrderStatus(orderId, next);
          router.refresh();
        });
      }}
    >
      <SelectMenu
        name="status"
        defaultValue={status}
        className="w-full"
        ariaLabel="Status"
        options={ORDER_STATUSES.map((value) => ({
          value,
          label: STATUS_LABELS[value].en,
        }))}
      />
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary w-full"
      >
        {pending ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
