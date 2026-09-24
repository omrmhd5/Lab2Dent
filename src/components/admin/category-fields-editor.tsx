"use client";

import { useActionState, useEffect, useState } from "react";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { pickLocale } from "@/lib/bilingual";
import { fill } from "@/i18n/dashboard";
import { reportAction } from "@/components/toast";
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
  labelAr: string | null;
  type: CategoryFieldType;
  required: boolean;
};

function TypeSelect({ defaultValue }: { defaultValue?: CategoryFieldType }) {
  const t = useDash();
  return (
    <SelectMenu
      name="type"
      defaultValue={defaultValue ?? "text"}
      ariaLabel={t.type}
      className="w-[7.5rem] shrink-0"
      options={[
        { value: "text", label: t.text },
        { value: "image", label: t.image },
      ]}
    />
  );
}

function RequiredCheck({ defaultChecked }: { defaultChecked?: boolean }) {
  const t = useDash();
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
      <input type="checkbox" name="required" defaultChecked={defaultChecked} />
      {t.required}
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
  const t = useDash();
  const [createState, createAction, createPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return createCategoryField(formData);
    },
    undefined,
  );

  useEffect(() => {
    reportAction(createState, t.fieldAdded);
  }, [createState]);

  return (
    <div className="space-y-6">
      <form
        key={fields.map((field) => field.id).join("|")}
        action={createAction}
        className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="categoryId" value={categoryId} />
        <input
          className="ui-input ui-input-grow"
          name="label"
          placeholder={t.english}
          aria-label={t.english}
          required
        />
        <input
          className="ui-input ui-input-grow"
          name="labelAr"
          dir="rtl"
          placeholder={t.arabic}
          aria-label={t.arabic}
          required
        />
        <TypeSelect />
        <RequiredCheck defaultChecked={false} />
        <button
          type="submit"
          disabled={createPending}
          className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
          {createPending ? <Spinner /> : null}
          {createPending ? t.adding : t.add}
        </button>
      </form>
      {createState && "error" in createState && createState.error ? (
        <p className="text-sm text-danger">{createState.error}</p>
      ) : null}

      <div className="space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-muted">{t.noFields}</p>
        ) : (
          fields.map((field) => (
            <FieldEditor key={field.id} categoryId={categoryId} field={field} />
          ))
        )}
      </div>
    </div>
  );
}

function fieldTypeLabel(
  type: CategoryFieldType,
  t: ReturnType<typeof useDash>,
) {
  return type === "image" ? t.image : t.text;
}

function FieldEditor({
  categoryId,
  field,
}: {
  categoryId: string;
  field: FieldRow;
}) {
  const t = useDash();
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
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return deleteCategoryField(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    reportAction(state, t.fieldSaved);
    if ("ok" in state && state.ok) setEditing(false);
  }, [state]);

  useEffect(() => {
    reportAction(deleteState, t.fieldDeleted);
  }, [deleteState]);

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
              aria-label={t.english}
              required
            />
            <input
              className="ui-input ui-input-grow"
              name="labelAr"
              dir="rtl"
              defaultValue={field.labelAr ?? ""}
              aria-label={t.arabic}
              required
            />
            <TypeSelect defaultValue={field.type} />
            <RequiredCheck defaultChecked={field.required} />
            <button
              type="submit"
              disabled={pending}
              className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
              {pending ? <Spinner /> : null}
              {pending ? t.saving : t.save}
            </button>
          </form>
          <button
            type="button"
            className="ui-press ui-btn ui-btn-secondary ui-btn-sm shrink-0"
            disabled={pending}
            onClick={() => setEditing(false)}>
            {t.cancel}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 font-bold">
            {pickLocale(t.locale, field.label, field.labelAr)}
          </p>
          <p className="text-sm text-muted">{fieldTypeLabel(field.type, t)}</p>
          <p className="text-sm text-muted">
            {field.required ? t.required : t.optional}
          </p>
          <EditIconButton
            label={fill(t.editName, { name: field.label })}
            onClick={() => setEditing(true)}
          />
          <form action={deleteAction}>
            <input type="hidden" name="id" value={field.id} />
            <input type="hidden" name="categoryId" value={categoryId} />
            <DeleteIconButton
              type="submit"
              label={fill(t.deleteName, { name: field.label })}
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
