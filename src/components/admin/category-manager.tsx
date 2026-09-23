"use client";

import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CategoryGroupForm,
  SubcategoryForm,
} from "@/components/admin/category-form";
import { CategoryFieldsEditor } from "@/components/admin/category-fields-editor";
import { deleteCategory } from "@/server/actions/categories";
import { ModalOverlay } from "@/components/modal-overlay";
import type { CategoryFieldType } from "@/db/schema";
import type { CategoryRecord } from "@/lib/categories";
import { formatEgp } from "@/lib/utils";

type FieldRow = {
  id: string;
  categoryId: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
};

type DeleteTarget = {
  id: string;
  name: string;
  kind: "group" | "subcategory";
};

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-accent-soft text-accent" : "bg-danger/10 text-danger"
      }`}>
      {active ? "Active" : "Hidden"}
    </span>
  );
}

function ConfirmDeleteDialog({
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
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const message =
    target.kind === "group"
      ? `Delete "${target.name}" and all its subcategories? This cannot be undone.`
      : `Delete subcategory "${target.name}"? This cannot be undone.`;

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
          Confirm delete
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
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className="ui-press ui-btn ui-btn-sm bg-danger text-white"
            onClick={onConfirm}>
            {pending ? "Deleting…" : "Delete"}
          </button>
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
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function remove(id: string, leavePage: boolean) {
    setDeleteNotice(null);
    start(async () => {
      const result = await deleteCategory(id);
      if (result && "error" in result && result.error) {
        setDeleteNotice(result.error);
        return;
      }
      if (result && "mode" in result && result.mode === "hidden") {
        setDeleteTarget(null);
        setBanner(result.message ?? "Hidden from students.");
        router.refresh();
        return;
      }
      setDeleteTarget(null);
      if (leavePage) {
        router.push("/admin/categories");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {banner ? (
        <p className="text-sm font-bold text-accent" role="status">
          {banner}
        </p>
      ) : null}

      <button
        type="button"
        className="ui-press text-sm font-bold text-danger"
        onClick={() =>
          setDeleteTarget({
            id: group.id,
            name: group.name,
            kind: "group",
          })
        }>
        Delete category
      </button>

      <section className="ui-card space-y-3">
        <p className="text-sm font-bold">Edit category</p>
        <CategoryGroupForm group={group} layout="row" />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold">Add subcategory</p>
        <div className="ui-card">
          <SubcategoryForm parentId={group.id} layout="row" />
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-sm font-bold">Subcategories</p>
        {subcategories.length === 0 ? (
          <p className="text-sm text-muted">No subcategories yet.</p>
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
  const [editing, setEditing] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  return (
    <section id={subcategory.id} className="ui-card space-y-5">
      {editing ? (
        <div className="flex flex-nowrap items-center gap-2">
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
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 font-bold">{subcategory.name}</p>
          <p className="font-mono text-sm">
            {subcategory.priceEgp === null
              ? "—"
              : formatEgp(subcategory.priceEgp)}
          </p>
          <p className="font-mono text-sm text-muted">
            {subcategory.costEgp === null
              ? "Cost —"
              : `Cost ${formatEgp(subcategory.costEgp)}`}
          </p>
          <p className="font-mono text-sm">
            {subcategory.priceEgp === null || subcategory.costEgp === null
              ? "Profit —"
              : `Profit ${formatEgp(subcategory.priceEgp - subcategory.costEgp)}`}
          </p>
          <StatusPill active={subcategory.isActive} />
          <button
            type="button"
            className="ui-press ui-btn ui-btn-secondary ui-btn-sm"
            onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            type="button"
            className="ui-press ui-btn ui-btn-sm bg-danger/10 text-danger"
            onClick={onRequestDelete}>
            Delete
          </button>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <button
          type="button"
          className="ui-press flex w-full items-center justify-between gap-3 text-start"
          aria-expanded={fieldsOpen}
          onClick={() => setFieldsOpen((open) => !open)}>
          <span className="text-sm font-bold">
            Fields
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
