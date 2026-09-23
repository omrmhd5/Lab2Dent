"use client";

import { useActionState, useEffect, useState } from "react";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/components/admin/icon-action-buttons";
import { SelectMenu } from "@/components/select-menu";
import {
  createCategoryField,
  deleteCategoryField,
  updateCategoryField,
} from "@/server/actions/category-fields";
import type { CategoryFieldType } from "@/db/schema";

type FieldRow = {
  id: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
};

function TypeSelect({ defaultValue }: { defaultValue?: CategoryFieldType }) {
  return (
    <SelectMenu
      name="type"
      defaultValue={defaultValue ?? "text"}
      ariaLabel="Type"
      className="w-[7.5rem] shrink-0"
      options={[
        { value: "text", label: "Text" },
        { value: "image", label: "Image" },
      ]}
    />
  );
}

function RequiredCheck({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
      <input type="checkbox" name="required" defaultChecked={defaultChecked} />
      Required
    </label>
  );
}

export function CategoryFieldsEditor({
  categoryId,
  fields,
}: {
  categoryId: string;
  fields: FieldRow[];
}) {
  const [createState, createAction, createPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return createCategoryField(formData);
    },
    undefined,
  );

  return (
    <div className="space-y-6">
      <form
        key={fields.map((field) => field.id).join("|")}
        action={createAction}
        className="flex flex-nowrap items-center gap-2">
        <input type="hidden" name="categoryId" value={categoryId} />
        <input
          className="ui-input ui-input-grow"
          name="label"
          placeholder="Field label"
          aria-label="Field label"
          required
        />
        <TypeSelect />
        <RequiredCheck defaultChecked={false} />
        <button
          type="submit"
          disabled={createPending}
          className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
          {createPending ? "Adding…" : "Add"}
        </button>
      </form>
      {createState && "error" in createState && createState.error ? (
        <p className="text-sm text-danger">{createState.error}</p>
      ) : null}

      <div className="space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-muted">No fields yet.</p>
        ) : (
          fields.map((field) => (
            <FieldEditor key={field.id} categoryId={categoryId} field={field} />
          ))
        )}
      </div>
    </div>
  );
}

function fieldTypeLabel(type: CategoryFieldType) {
  return type === "image" ? "Image" : "Text";
}

function FieldEditor({
  categoryId,
  field,
}: {
  categoryId: string;
  field: FieldRow;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    async (
      _prev: { error?: string; ok?: true } | undefined,
      formData: FormData,
    ) => {
      return updateCategoryField(formData);
    },
    undefined,
  );
  const [, deleteAction, deletePending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return deleteCategoryField(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setEditing(false);
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-border p-3">
      {editing ? (
        <div className="flex flex-nowrap items-center gap-2">
          <form
            action={action}
            className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
            <input type="hidden" name="id" value={field.id} />
            <input type="hidden" name="categoryId" value={categoryId} />
            <input
              className="ui-input ui-input-grow"
              name="label"
              defaultValue={field.label}
              aria-label="Field label"
              required
            />
            <TypeSelect defaultValue={field.type} />
            <RequiredCheck defaultChecked={field.required} />
            <button
              type="submit"
              disabled={pending}
              className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
              {pending ? "Saving…" : "Save"}
            </button>
          </form>
          <button
            type="button"
            className="ui-press ui-btn ui-btn-secondary ui-btn-sm shrink-0"
            disabled={pending}
            onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 font-bold">{field.label}</p>
          <p className="text-sm text-muted">{fieldTypeLabel(field.type)}</p>
          <p className="text-sm text-muted">
            {field.required ? "Required" : "Optional"}
          </p>
          <EditIconButton
            label={`Edit ${field.label}`}
            onClick={() => setEditing(true)}
          />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={field.id} />
            <input type="hidden" name="categoryId" value={categoryId} />
            <DeleteIconButton
              type="submit"
              label={`Delete ${field.label}`}
              pending={deletePending}
            />
          </form>
        </div>
      )}
      {state && "error" in state && state.error ? (
        <p className="mt-2 text-sm text-danger">{state.error}</p>
      ) : null}
    </div>
  );
}
