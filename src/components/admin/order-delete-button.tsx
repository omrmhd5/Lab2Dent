"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ConfirmDeleteButton,
  DeleteIconButton,
} from "@/components/admin/icon-action-buttons";
import { ModalOverlay } from "@/components/modal-overlay";
import { deleteOrders } from "@/server/actions/orders";
import { reportAction } from "@/components/toast";

function ConfirmDeleteDialog({
  label,
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  label: string;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <ModalOverlay
      zIndex={60}
      backdropClassName="bg-black/60"
      scrollable={false}
      onBackdropClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-order-title"
        className="ui-card w-full max-w-sm">
        <h3 id="delete-order-title" className="text-lg font-bold">
          Confirm delete
        </h3>
        <p className="mt-2 text-sm text-muted">
          Delete {label}? This cannot be undone.
        </p>
        {error ? (
          <p className="mt-3 text-sm font-bold text-danger" role="status">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="ui-press ui-btn ui-btn-secondary ui-btn-sm"
            disabled={pending}
            onClick={onCancel}>
            Cancel
          </button>
          <ConfirmDeleteButton pending={pending} onClick={onConfirm} />
        </div>
      </div>
    </ModalOverlay>
  );
}

export function OrderDeleteButton({
  orderId,
  orderCode,
}: {
  orderId: string;
  orderCode: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function confirmDelete() {
    setError(null);
    start(async () => {
      const result = await deleteOrders([orderId]);
      reportAction(result, "Order deleted.");
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push("/dashboard");
    });
  }

  return (
    <>
      <DeleteIconButton
        label={`Delete order ${orderCode}`}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      />
      {open ? (
        <ConfirmDeleteDialog
          label={`order ${orderCode}`}
          pending={pending}
          error={error}
          onConfirm={confirmDelete}
          onCancel={() => {
            setOpen(false);
            setError(null);
          }}
        />
      ) : null}
    </>
  );
}
