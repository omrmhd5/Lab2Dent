"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { OrderStatus, StaffRole } from "@/db/schema";
import { ModalOverlay } from "@/components/modal-overlay";
import { OrderStatusPill } from "@/components/admin/status-pill";
import { STATUS_LABELS, selectableStatusesForOrders } from "@/lib/status";
import { formatEgp } from "@/lib/utils";
import {
  ConfirmDeleteButton,
  DeleteIconButton,
} from "@/components/admin/icon-action-buttons";
import { bulkUpdateStatus, deleteOrders } from "@/server/actions/orders";
import { SelectMenu } from "@/components/select-menu";
import { Spinner } from "@/components/spinner";
import { reportAction } from "@/components/toast";

export type OrderRow = {
  id: string;
  orderNumber: number;
  code: string;
  categoryName: string;
  priceEgp: number;
  costEgp: number | null;
  status: OrderStatus;
  assignedLabName: string | null;
  createdAt: Date | string;
  studentName: string;
  studentPhone: string;
  studentUniversity: string;
};

type SortKey = "orderNumber" | "priceEgp" | "costEgp" | "profit";
type SortDir = "asc" | "desc";

function orderProfit(order: OrderRow) {
  return order.costEgp === null ? null : order.priceEgp - order.costEgp;
}

function sortValue(order: OrderRow, key: SortKey) {
  if (key === "profit") return orderProfit(order);
  if (key === "costEgp") return order.costEgp;
  return order[key];
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  sortDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  const Icon = sortDir === "asc" ? CaretUp : CaretDown;

  return (
    <th className="w-px px-2 py-3 font-medium whitespace-nowrap">
      <button
        type="button"
        className={`ui-press inline-flex items-center gap-0.5 whitespace-nowrap rounded-lg px-0.5 py-0.5 ${
          active ? "text-brand" : "text-muted hover:text-foreground"
        }`}
        aria-label={`Sort by ${label} ${active ? (sortDir === "asc" ? "ascending" : "descending") : ""}`}
        onClick={() => onSort(sortKey)}>
        {label}
        {active ? (
          <Icon size={14} weight="bold" aria-hidden="true" />
        ) : (
          <span className="inline-flex flex-col opacity-40" aria-hidden="true">
            <CaretUp size={10} weight="bold" className="-mb-1" />
            <CaretDown size={10} weight="bold" />
          </span>
        )}
      </button>
    </th>
  );
}

type DeleteTarget = {
  ids: string[];
  label: string;
};

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

export function OrdersTable({
  orders,
  role,
  allowedStatuses,
}: {
  orders: OrderRow[];
  role: StaffRole;
  allowedStatuses: OrderStatus[];
}) {
  const showPrice = role !== "lab";
  const showMoney = role === "admin";
  const canDelete = role === "admin";
  const columnCount =
    7 + (showPrice ? 1 : 0) + (showMoney ? 2 : 0) + (canDelete ? 1 : 0);
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<OrderStatus>(
    allowedStatuses[0] ?? "confirmed",
  );
  const [pending, start] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedOrders = useMemo(() => {
    if (!sortKey) return orders;

    return [...orders].sort((a, b) => {
      const aValue = sortValue(a, sortKey);
      const bValue = sortValue(b, sortKey);

      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (aValue === bValue) return 0;
      const ascending = aValue < bValue ? -1 : 1;
      return sortDir === "asc" ? ascending : -ascending;
    });
  }, [orders, sortKey, sortDir]);

  const allIds = useMemo(() => orders.map((order) => order.id), [orders]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;
  const selectedOrders = useMemo(
    () => orders.filter((order) => selected.includes(order.id)),
    [orders, selected],
  );
  const bulkStatusOptions = useMemo(
    () => selectableStatusesForOrders(allowedStatuses, selectedOrders),
    [allowedStatuses, selectedOrders],
  );

  useEffect(() => {
    if (bulkStatusOptions.length > 0 && !bulkStatusOptions.includes(status)) {
      setStatus(bulkStatusOptions[0]);
    }
  }, [bulkStatusOptions, status]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteOrders(deleteTarget.ids);
      reportAction(
        result,
        deleteTarget.ids.length === 1 ? "Order deleted." : "Orders deleted.",
      );
      if (result && "error" in result && result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteTarget(null);
      setSelected((current) =>
        current.filter((id) => !deleteTarget.ids.includes(id)),
      );
      router.refresh();
    });
  }

  return (
    <div className="min-w-0">
      {selected.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-md)]">
          <p className="text-sm">{selected.length} selected</p>
          <SelectMenu
            className="w-72 shrink-0"
            ariaLabel="Bulk status"
            value={
              bulkStatusOptions.includes(status) ? status : bulkStatusOptions[0]
            }
            onChange={(next) => setStatus(next as OrderStatus)}
            options={bulkStatusOptions.map((value) => ({
              value,
              label: STATUS_LABELS[value].en,
            }))}
          />
          <button
            type="button"
            disabled={pending || bulkStatusOptions.length === 0}
            className="ui-press ui-btn ui-btn-primary"
            onClick={() => {
              start(async () => {
                const result = await bulkUpdateStatus(selected, status);
                reportAction(result, "Status saved.");
                if ("error" in result && result.error) {
                  setError(result.error);
                  return;
                }
                setSelected([]);
                setError(null);
                router.refresh();
              });
            }}>
            {pending ? <Spinner /> : null}
            Update status
          </button>
          {canDelete ? (
            <DeleteIconButton
              label={`Delete ${selected.length} selected order${selected.length === 1 ? "" : "s"}`}
              variant="solid"
              pending={deletePending}
              onClick={() => {
                setDeleteError(null);
                setDeleteTarget({
                  ids: selected,
                  label: `${selected.length} order${selected.length === 1 ? "" : "s"}`,
                });
              }}
            />
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full table-auto text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="w-px px-2 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : allIds)}
                  aria-label="Select all orders"
                />
              </th>
              <SortableHeader
                label="No."
                sortKey="orderNumber"
                activeKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
              <th className="w-px px-2 py-3 font-medium whitespace-nowrap">
                Code
              </th>
              <th className="px-2 py-3 font-medium whitespace-nowrap">
                Student
              </th>
              <th className="px-2 py-3 font-medium whitespace-nowrap">
                University
              </th>
              <th className="px-2 py-3 font-medium whitespace-nowrap">Work</th>
              {showPrice ? (
                <SortableHeader
                  label="Price"
                  sortKey="priceEgp"
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              ) : null}
              {showMoney ? (
                <SortableHeader
                  label="Cost"
                  sortKey="costEgp"
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              ) : null}
              {showMoney ? (
                <SortableHeader
                  label="Profit"
                  sortKey="profit"
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                />
              ) : null}
              <th className="w-px px-2 py-3 font-medium whitespace-nowrap">
                Status
              </th>
              {canDelete ? (
                <th className="w-px px-2 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-4 py-10 text-muted">
                  No orders yet.
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0">
                  <td className="w-px px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(order.id)}
                      onChange={() => toggle(order.id)}
                      aria-label={`Select ${order.code}`}
                    />
                  </td>
                  <td className="w-px px-2 py-3 font-mono text-xs whitespace-nowrap text-muted">
                    #{order.orderNumber}
                  </td>
                  <td className="w-px px-2 py-3 font-mono text-xs whitespace-nowrap">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-accent">
                      {order.code}
                    </Link>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    <div className="font-bold">{order.studentName}</div>
                    <div className="text-xs text-muted">
                      {order.studentPhone}
                    </div>
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    {order.studentUniversity}
                  </td>
                  <td className="px-2 py-3 whitespace-nowrap">
                    {order.categoryName}
                  </td>
                  {showPrice ? (
                    <td className="w-px px-2 py-3 font-mono text-xs whitespace-nowrap">
                      {formatEgp(order.priceEgp)}
                    </td>
                  ) : null}
                  {showMoney ? (
                    <td className="w-px px-2 py-3 font-mono text-xs whitespace-nowrap text-muted">
                      {order.costEgp === null ? "—" : formatEgp(order.costEgp)}
                    </td>
                  ) : null}
                  {showMoney ? (
                    <td className="w-px px-2 py-3 font-mono text-xs whitespace-nowrap">
                      {order.costEgp === null
                        ? "—"
                        : formatEgp(order.priceEgp - order.costEgp)}
                    </td>
                  ) : null}
                  <td className="w-px px-2 py-3 whitespace-nowrap">
                    <OrderStatusPill
                      status={order.status}
                      labName={order.assignedLabName}
                      className="px-2.5 py-1"
                    />
                  </td>
                  {canDelete ? (
                    <td className="w-px px-2 py-3 whitespace-nowrap">
                      <DeleteIconButton
                        label={`Delete order ${order.code}`}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget({
                            ids: [order.id],
                            label: `order ${order.code}`,
                          });
                        }}
                      />
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <ConfirmDeleteDialog
          label={deleteTarget.label}
          pending={deletePending}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
        />
      ) : null}
    </div>
  );
}
