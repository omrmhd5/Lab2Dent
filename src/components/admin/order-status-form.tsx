"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { OrderStatus } from "@/db/schema";
import { STATUS_LABELS, selectableStatuses } from "@/lib/status";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";
import { updateOrderStatus } from "@/server/actions/orders";
import { SelectMenu } from "@/components/select-menu";

export function OrderStatusForm({
  orderId,
  status,
  allowedStatuses,
}: {
  orderId: string;
  status: OrderStatus;
  allowedStatuses: OrderStatus[];
}) {
  const t = useDash();
  const router = useRouter();
  const [pending, start] = useTransition();
  const options = selectableStatuses(allowedStatuses, status);

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted">
        {t.noFurtherStatus}
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const next = String(form.get("status")) as OrderStatus;
        start(async () => {
          const result = await updateOrderStatus(orderId, next);
          reportAction(result, t.statusSaved);
          if (result && "ok" in result && result.ok) router.refresh();
        });
      }}>
      <SelectMenu
        name="status"
        defaultValue={options[0]}
        className="w-full"
        ariaLabel="Status"
        options={options.map((value) => ({
          value,
          label: STATUS_LABELS[value][t.locale],
        }))}
      />
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary w-full">
        {pending ? <Spinner /> : null}
        {pending ? "Saving…" : "Save status"}
      </button>
    </form>
  );
}
