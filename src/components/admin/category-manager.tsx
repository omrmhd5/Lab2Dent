"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CategoryGroupForm,
  SubcategoryForm,
} from "@/components/admin/category-form";
import { CategoryFieldsEditor } from "@/components/admin/category-fields-editor";
import {
  ConfirmDeleteButton,
  DeleteIconButton,
  EditIconButton,
} from "@/components/admin/icon-action-buttons";
import { deleteCategory } from "@/server/actions/categories";
import { useDash } from "@/components/dashboard-i18n";
import { pickLocale } from "@/lib/bilingual";
import { fill } from "@/i18n/dashboard";
import { reportAction } from "@/components/toast";
import { ModalOverlay } from "@/components/modal-overlay";
import type { CategoryFieldType } from "@/db/schema";
import type { CategoryRecord } from "@/lib/categories";
import { formatEgp } from "@/lib/utils";

type FieldRow = {
  id: string;
  categoryId: string;
  label: string;
  labelAr: string | null;
  type: CategoryFieldType;
  required: boolean;
};

type DeleteTarget = {
  id: string;
  name: string;
  kind: "group" | "subcategory";
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

export function ConfirmDeleteDialog({
  target,
  pending,
  notice,
  onConfirm,
  onCancel,
}: {
  target: DeleteTarget;
  pending: boolean;
  notice: string | null;
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

  const message =
    target.kind === "group"
      ? fill(t.deleteCategoryGroupBody, { name: target.name })
      : fill(t.deleteSubcategoryBody, { name: target.name });

  return (
    <ModalOverlay
      zIndex={60}
      backdropClassName="bg-black/60"
      scrollable={false}
      onBackdropClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="ui-card w-full max-w-sm">
        <h3 id="delete-dialog-title" className="text-lg font-bold">
          {t.confirmDelete}
        </h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        {notice ? (
          <p className="mt-3 text-sm font-bold text-danger" role="status">
            {notice}
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

export function CategoryManager({
  group,
  subcategories,
  fields,
}: {
  group: CategoryRecord;
  subcategories: CategoryRecord[];
  fields: FieldRow[];
}) {
  const t = useDash();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove(id: string, leavePage: boolean) {
    setDeleteNotice(null);
    start(async () => {
      const result = await deleteCategory(id);
      reportAction(result, t.deleted);
      if (result && "error" in result && result.error) {
        setDeleteNotice(result.error);
        return;
      }
      setDeleteTarget(null);
      if (leavePage) {
        router.push("/dashboard/categories");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="ui-card space-y-3">
        <p className="text-sm font-bold">{t.editCategory}</p>
        <CategoryGroupForm group={group} layout="row" />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold">{t.addSubcategory}</p>
        <div className="ui-card">
          <SubcategoryForm parentId={group.id} layout="row" />
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-sm font-bold">{t.subcategories}</p>
        {subcategories.length === 0 ? (
          <p className="text-sm text-muted">{t.noSubcategories}</p>
        ) : (
          subcategories.map((subcategory) => (
            <SubcategoryCard
              key={subcategory.id}
              parentId={group.id}
              subcategory={subcategory}
              fields={fields.filter(
                (field) => field.categoryId === subcategory.id,
              )}
              onRequestDelete={() =>
                setDeleteTarget({
                  id: subcategory.id,
                  name: subcategory.name,
                  kind: "subcategory",
                })
              }
            />
          ))
        )}
      </section>

      {deleteTarget ? (
        <ConfirmDeleteDialog
          target={deleteTarget}
          pending={pending}
          notice={deleteNotice}
          onConfirm={() => {
            if (!deleteTarget) return;
            remove(deleteTarget.id, deleteTarget.kind === "group");
          }}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteNotice(null);
          }}
        />
      ) : null}
    </div>
  );
}

function SubcategoryCard({
  parentId,
  subcategory,
  fields,
  onRequestDelete,
}: {
  parentId: string;
  subcategory: CategoryRecord;
  fields: FieldRow[];
  onRequestDelete: () => void;
}) {
  const t = useDash();
  const [editing, setEditing] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  return (
    <section id={subcategory.id} className="ui-card space-y-5">
      {editing ? (
        <div className="flex flex-wrap items-center gap-2">
          <SubcategoryForm
            parentId={parentId}
            subcategory={subcategory}
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
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-bold">
              {pickLocale(t.locale, subcategory.name, subcategory.nameAr)}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <EditIconButton label={t.edit} onClick={() => setEditing(true)} />
              <DeleteIconButton label={t.delete} onClick={onRequestDelete} />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="min-w-0">
              <dt className="text-xs text-muted">{t.price}</dt>
              <dd className="mt-0.5 break-words font-mono font-bold">
                {subcategory.priceEgp === null
                  ? "—"
                  : formatEgp(subcategory.priceEgp)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{t.cost}</dt>
              <dd className="mt-0.5 break-words font-mono">
                {subcategory.costEgp === null
                  ? "—"
                  : formatEgp(subcategory.costEgp)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{t.profit}</dt>
              <dd className="mt-0.5 break-words font-mono font-bold">
                {subcategory.priceEgp === null || subcategory.costEgp === null
                  ? "—"
                  : formatEgp(subcategory.priceEgp - subcategory.costEgp)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{t.status}</dt>
              <dd className="mt-1">
                <StatusPill active={subcategory.isActive} />
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <button
          type="button"
          className="ui-press flex w-full items-center justify-between gap-3 text-start"
          aria-expanded={fieldsOpen}
          onClick={() => setFieldsOpen((open) => !open)}>
          <span className="text-sm font-bold">
            {t.fields}
            {fields.length > 0 ? (
              <span className="ms-2 font-normal text-muted">
                ({fields.length})
              </span>
            ) : null}
          </span>
          {fieldsOpen ? (
            <CaretUp
              size={16}
              weight="bold"
              aria-hidden="true"
              className="text-muted"
            />
          ) : (
            <CaretDown
              size={16}
              weight="bold"
              aria-hidden="true"
              className="text-muted"
            />
          )}
        </button>
        {fieldsOpen ? (
          <div className="mt-3">
            <CategoryFieldsEditor
              categoryId={subcategory.id}
              fields={fields.map((field) => ({
                id: field.id,
                label: field.label,
                labelAr: field.labelAr,
                type: field.type,
                required: field.required,
              }))}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
