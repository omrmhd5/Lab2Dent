"use client";

import { useActionState, useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";
import {
  createUniversity,
  updateUniversity,
} from "@/server/actions/universities";

type University = {
  id: string;
  name: string;
  nameAr: string | null;
  isActive: boolean;
};

export function UniversityForm({
  university,
  layout = "default",
  onSuccess,
}: {
  university?: University;
  layout?: "default" | "row";
  onSuccess?: () => void;
}) {
  const t = useDash();
  const action = university ? updateUniversity : createUniversity;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    reportAction(state, university ? t.universitySaved : t.universityAdded);
    if ("ok" in state && state.ok) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (layout === "row") {
    return (
      <div className="min-w-0 flex-1 space-y-2">
        <form
          action={formAction}
          className="flex w-full flex-wrap items-center gap-2">
          {university ? (
            <input type="hidden" name="id" value={university.id} />
          ) : null}
          <input
            className="ui-input ui-input-grow"
            name="name"
            defaultValue={university?.name ?? ""}
            placeholder={t.english}
            aria-label={t.english}
            required
          />
          <input
            className="ui-input ui-input-grow"
            name="nameAr"
            dir="rtl"
            defaultValue={university?.nameAr ?? ""}
            placeholder={t.arabic}
            aria-label={t.arabic}
            required
          />
          {university ? (
            <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={university.isActive}
              />
              {t.active}
            </label>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {pending ? <Spinner /> : null}
            {university ? t.save : t.addUniversity}
          </button>
        </form>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      {university ? (
        <input type="hidden" name="id" value={university.id} />
      ) : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">{t.english}</span>
        <input
          className="ui-input min-w-48"
          name="name"
          defaultValue={university?.name ?? ""}
          required
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">{t.arabic}</span>
        <input
          className="ui-input min-w-48"
          name="nameAr"
          dir="rtl"
          defaultValue={university?.nameAr ?? ""}
          required
        />
      </label>
      {university ? (
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={university.isActive}
          />
          {t.active}
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {pending ? <Spinner /> : null}
        {university ? t.save : t.addUniversity}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
