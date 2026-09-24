"use client";

import { useEffect, useState, useTransition } from "react";
import { UniversityForm } from "@/components/admin/university-form";
import { deleteUniversity } from "@/server/actions/universities";
import { useDash } from "@/components/dashboard-i18n";
import { pickLocale } from "@/lib/bilingual";
import { fill } from "@/i18n/dashboard";
import { reportAction } from "@/components/toast";
import {
  ConfirmDeleteButton,
  DeleteIconButton,
  EditIconButton,
} from "@/components/admin/icon-action-buttons";
import { ModalOverlay } from "@/components/modal-overlay";

type University = {
  id: string;
  name: string;
  nameAr: string | null;
  isActive: boolean;
};

function StatusPill({ active }: { active: boolean }) {
  const t = useDash();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-accent-soft text-accent" : "bg-danger/10 text-danger"
      }`}>
      {active ? t.active : t.hidden}
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
        aria-labelledby="delete-university-title"
        className="ui-card w-full max-w-sm">
        <h3 id="delete-university-title" className="text-lg font-bold">
          {t.confirmDelete}
        </h3>
        <p className="mt-2 text-sm text-muted">
          {fill(t.deleteUniversityBody, { name })}
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

export function UniversityTable({ initial }: { initial: University[] }) {
  const t = useDash();
  const [rows, setRows] = useState(initial);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const signature = initial
    .map((row) => `${row.id}:${row.name}:${row.isActive}`)
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
      const result = await deleteUniversity(deleteId);
      reportAction(result, t.universityDeleted);
      if (result && "error" in result && result.error) {
        setDeleteError(result.error);
        return;
      }
      setDeleteId(null);
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="w-[44%] px-4 py-3 font-medium">{t.university}</th>
              <th className="w-[22%] px-4 py-3 font-medium">{t.status}</th>
              <th className="w-[34%] px-4 py-3 font-medium text-end">
                <span className="sr-only">{t.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-muted">
                  No universities yet. Add one above.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <UniversityRow
                  key={row.id}
                  university={row}
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

function UniversityRow({
  university,
  onRequestDelete,
}: {
  university: University;
  onRequestDelete: () => void;
}) {
  const t = useDash();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-b border-border last:border-0">
        <td colSpan={3} className="px-4 py-3">
          <div className="flex flex-nowrap items-center gap-2">
            <UniversityForm
              university={university}
              layout="row"
              onSuccess={() => setEditing(false)}
            />
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
      <td className="truncate px-4 py-3 font-bold">
        {pickLocale(t.locale, university.name, university.nameAr)}
      </td>
      <td className="px-4 py-3">
        <StatusPill active={university.isActive} />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          <EditIconButton label={t.edit} onClick={() => setEditing(true)} />
          <DeleteIconButton
            label={fill(t.deleteName, { name: university.name })}
            onClick={onRequestDelete}
          />
        </div>
      </td>
    </tr>
  );
}
