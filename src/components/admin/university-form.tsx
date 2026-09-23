"use client";

import { useActionState, useEffect } from "react";
import {
  createUniversity,
  updateUniversity,
} from "@/server/actions/universities";

type University = {
  id: string;
  name: string;
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
  const action = university ? updateUniversity : createUniversity;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  if (layout === "row") {
    return (
      <div className="min-w-0 flex-1 space-y-2">
        <form
          action={formAction}
          className="flex w-full flex-nowrap items-center gap-2">
          {university ? (
            <input type="hidden" name="id" value={university.id} />
          ) : null}
          <input
            className="ui-input ui-input-grow"
            name="name"
            defaultValue={university?.name ?? ""}
            placeholder="University name"
            aria-label="University name"
            required
          />
          {university ? (
            <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={university.isActive}
              />
              Active
            </label>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {university ? "Save" : "Add university"}
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
        <span className="block text-xs text-muted">Name</span>
        <input
          className="ui-input min-w-48"
          name="name"
          defaultValue={university?.name ?? ""}
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
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {university ? "Save" : "Add university"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
