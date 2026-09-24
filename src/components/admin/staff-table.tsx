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
import { useDash } from "@/components/dashboard-i18n";
import { pickLocale } from "@/lib/bilingual";
import { fill } from "@/i18n/dashboard";
import { reportAction } from "@/components/toast";

type Option = { value: string; label: string };

function roleLabel(role: StaffRole, t: ReturnType<typeof useDash>) {
  if (role === "admin") return t.roleAdmin;
  if (role === "lab") return t.roleLab;
  return t.roleEmployee;
}

function StatusPill({ active }: { active: boolean }) {
  const t = useDash();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-accent-soft text-accent" : "bg-danger/10 text-danger"
      }`}>
      {active ? t.active : t.inactive}
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
  const t = useDash();
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
          {t.confirmDelete}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {fill(t.deleteStaffBody, { name })}
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
            {t.cancel}
          </button>
          <ConfirmDeleteButton
            label={t.delete}
            pending={pending}
            onClick={onConfirm}
          />
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
    StaffRow & {
      universityName: string | null;
      universityNameAr: string | null;
      categoryName: string | null;
      categoryNameAr: string | null;
    }
  >;
  universities: Option[];
  categories: Option[];
  currentStaffId: string;
}) {
  const t = useDash();
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
      reportAction(result, t.staffDeleted);
      if (result && "error" in result && result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteId(null);
    });
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface px-4 py-10 text-sm text-muted">
            {t.noStaffYet}
          </p>
        ) : (
          rows.map((row) => (
            <StaffMobileCard
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
      </div>
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
        <table className="w-full min-w-[720px] table-auto text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">{t.name}</th>
              <th className="px-4 py-3 font-medium">{t.email}</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">
                {t.role}
              </th>
              <th className="px-4 py-3 font-medium">{t.university}</th>
              <th className="px-4 py-3 font-medium">{t.category}</th>
              <th className="px-4 py-3 font-medium">{t.status}</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">{t.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-muted">
                  {t.noStaffYet}
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
                    rows.filter(
                      (item) => item.role === "admin" && item.isActive,
                    ).length <= 1
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

function StaffMobileCard({
  row,
  universities,
  categories,
  canDelete,
  soleAdmin,
  onRequestDelete,
}: {
  row: StaffRow & {
    universityName: string | null;
    universityNameAr: string | null;
    categoryName: string | null;
    categoryNameAr: string | null;
  };
  universities: Option[];
  categories: Option[];
  canDelete: boolean;
  soleAdmin: boolean;
  onRequestDelete: () => void;
}) {
  const t = useDash();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <article className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <EmployeeForm
          employee={row}
          universities={universities}
          categories={categories}
          soleAdmin={soleAdmin}
          onSuccess={() => setEditing(false)}
        />
        <button
          type="button"
          className="ui-press ui-btn ui-btn-secondary ui-btn-sm"
          onClick={() => setEditing(false)}>
          {t.cancel}
        </button>
      </article>
    );
  }

  const facts = [
    { label: t.email, value: row.email },
    { label: t.role, value: roleLabel(row.role, t) },
    {
      label: t.university,
      value: row.universityName
        ? pickLocale(t.locale, row.universityName, row.universityNameAr)
        : "—",
    },
    {
      label: t.category,
      value: row.categoryName
        ? pickLocale(t.locale, row.categoryName, row.categoryNameAr)
        : "—",
    },
  ];

  return (
    <article className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-bold">{row.name}</p>
        <StatusPill active={row.isActive} />
      </div>
      <dl className="grid gap-2 text-sm">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-muted">{fact.label}</dt>
            <dd className="mt-0.5 break-all">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end gap-2">
        <EditIconButton
          label={fill(t.editName, { name: row.name })}
          onClick={() => setEditing(true)}
        />
        {canDelete ? (
          <DeleteIconButton
            label={fill(t.deleteName, { name: row.name })}
            onClick={onRequestDelete}
          />
        ) : null}
      </div>
    </article>
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
    universityNameAr: string | null;
    categoryName: string | null;
    categoryNameAr: string | null;
  };
  universities: Option[];
  categories: Option[];
  canDelete: boolean;
  soleAdmin: boolean;
  onRequestDelete: () => void;
}) {
  const t = useDash();
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
              {t.cancel}
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
      <td className="px-4 py-3 whitespace-nowrap">{roleLabel(row.role, t)}</td>
      <td className="px-4 py-3 text-muted">
        {row.universityName
          ? pickLocale(t.locale, row.universityName, row.universityNameAr)
          : "—"}
      </td>
      <td className="px-4 py-3 text-muted">
        {row.categoryName
          ? pickLocale(t.locale, row.categoryName, row.categoryNameAr)
          : "—"}
      </td>
      <td className="px-4 py-3">
        <StatusPill active={row.isActive} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <EditIconButton
            label={fill(t.editName, { name: row.name })}
            onClick={() => setEditing(true)}
          />
          {canDelete ? (
            <DeleteIconButton
              label={fill(t.deleteName, { name: row.name })}
              onClick={onRequestDelete}
            />
          ) : null}
        </div>
      </td>
    </tr>
  );
}
