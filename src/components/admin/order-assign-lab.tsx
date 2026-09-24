"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SelectMenu } from "@/components/select-menu";
import { assignOrderToLab } from "@/server/actions/orders";

export function OrderAssignLabCard({
  orderId,
  assignedLabId,
  labs,
}: {
  orderId: string;
  assignedLabId: string | null;
  labs: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [labId, setLabId] = useState(assignedLabId ?? labs[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section className="ui-card h-full">
      <h2 className="text-sm font-bold">Assign lab</h2>
      {labs.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Add an active lab account before assigning this order.
        </p>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            start(async () => {
              const result = await assignOrderToLab(orderId, labId);
              if (result && "error" in result && result.error) {
                setError(result.error);
                return;
              }
              router.refresh();
            });
          }}>
          <SelectMenu
            ariaLabel="Lab"
            className="w-full"
            value={labId}
            onChange={setLabId}
            options={labs.map((lab) => ({ value: lab.id, label: lab.name }))}
          />
          <button
            type="submit"
            disabled={pending || !labId}
            className="ui-press ui-btn ui-btn-primary w-full">
            {pending ? "Assigning…" : "Assign"}
          </button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </form>
      )}
    </section>
  );
}
