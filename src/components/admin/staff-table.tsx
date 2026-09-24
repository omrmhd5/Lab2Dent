"use client";

import { useEffect, useState, useTransition } from "react";
import { EmployeeForm, type StaffRow } from "@/components/admin/employee-form";
import {
  ConfirmDeleteButton,
  DeleteIconButton,
  EditIconButton,
} from "@/components/admin/icon-action-buttons";
import { ModalOverlay } from "@/components/modal-overlay";
import type { StaffRole } from "@/db/schema";
import { deleteEmployee } from "@/server/actions/employees";
import { reportAction } from "@/components/toast";

type Option = { value: string; label: string };

const ROLE_LABEL: Record<StaffRole, string> = {
  admin: "Admin",
  employee: "Employee",
  lab: "Lab",
};

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-accent-soft text-accent" : "bg-danger/10 text-danger"
      }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ConfirmDeleteDialog({
  name,
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  name: string;
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
        aria-labelledby="delete-staff-title"
        className="ui-card w-full max-w-sm">
        <h3 id="delete-staff-title" className="text-lg font-bold">
          Confirm delete
        </h3>
        <p className="mt-2 text-sm text-muted">
          Delete {name}? They will no longer be able to sign in. Order history
          stays, without their name. This cannot be undone.
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

export function StaffTable({
  initial,
  universities,
  categories,
  currentStaffId,
}: {
  initial: Array<
    StaffRow & { universityName: string | null; categoryName: string | null }
  >;
  universities: Option[];
  categories: Option[];
  currentStaffId: string;
}) {
  const [rows, setRows] = useState(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const signature = initial
    .map(
      (row) =>
        `${row.id}:${row.name}:${row.email}:${row.role}:${row.isActive}:${row.universityId}:${row.categoryId}`,
    )
    .join("|");

  useEffect(() => {
    setRows(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- signature tracks server list changes
  }, [signature]);

  const deleteTarget = rows.find((row) => row.id === deleteId) ?? null;

  function confirmDelete() {
    if (!deleteId) return;
    setDeleteError(null);
    start(async () => {
      const result = await deleteEmployee(deleteId);
      reportAction(result, "Staff deleted.");
      if (result && "error" in result && result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteId(null);
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full table-auto text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Role</th>
              <th className="px-4 py-3 font-medium">University</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-muted">
                  No staff yet. Add someone above.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
              <StaffTableRow
                key={row.id}
                row={row}
                universities={universities}
                categories={categories}
                soleAdmin={
                  row.role === "admin" &&
                  row.isActive &&
                  rows.filter((item) => item.role === "admin" && item.isActive)
                    .length <= 1
                }
                canDelete={row.id !== currentStaffId}
                  onRequestDelete={() => {
                    setDeleteError(null);
                    setDeleteId(row.id);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {deleteTarget ? (
        <ConfirmDeleteDialog
          name={deleteTarget.name}
          pending={pending}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteId(null);
            setDeleteError(null);
          }}
        />
      ) : null}
    </>
  );
}

function StaffTableRow({
  row,
  universities,
  categories,
  canDelete,
  soleAdmin,
  onRequestDelete,
}: {
  row: StaffRow & {
    universityName: string | null;
    categoryName: string | null;
  };
  universities: Option[];
  categories: Option[];
  canDelete: boolean;
  soleAdmin: boolean;
  onRequestDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={7} className="px-4 py-3">
          <div className="flex flex-wrap items-start gap-2">
            <div className="min-w-0 flex-1">
              <EmployeeForm
                employee={row}
                universities={universities}
                categories={categories}
                soleAdmin={soleAdmin}
                onSuccess={() => setEditing(false)}
              />
            </div>
            <button
              type="button"
              className="ui-press ui-btn ui-btn-secondary ui-btn-sm shrink-0"
              onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-bold">{row.name}</td>
      <td className="px-4 py-3">{row.email}</td>
      <td className="px-4 py-3 whitespace-nowrap">{ROLE_LABEL[row.role]}</td>
      <td className="px-4 py-3 text-muted">{row.universityName ?? "—"}</td>
      <td className="px-4 py-3 text-muted">{row.categoryName ?? "—"}</td>
      <td className="px-4 py-3">
        <StatusPill active={row.isActive} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <EditIconButton
            label={`Edit ${row.name}`}
            onClick={() => setEditing(true)}
          />
          {canDelete ? (
            <DeleteIconButton
              label={`Delete ${row.name}`}
              onClick={onRequestDelete}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}
