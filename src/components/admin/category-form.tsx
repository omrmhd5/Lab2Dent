"use client";

import { useActionState } from "react";
import { createCategory, updateCategory } from "@/server/actions/categories";

type Category = {
  id: string;
  name: string;
  priceEgp: number;
  isActive: boolean;
};

export function CategoryForm({
  category,
  layout = "default",
}: {
  category?: Category;
  layout?: "default" | "row";
}) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  return (
    <form
      action={formAction}
      className={`flex flex-wrap gap-3 ${layout === "row" ? "items-center" : "items-end"}`}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">Name</span>
        <input
          className="ui-input min-w-48"
          name="name"
          defaultValue={category?.name ?? ""}
          required
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">Price EGP</span>
        <input
          className="ui-input w-32"
          name="priceEgp"
          type="number"
          min={0}
          step={1}
          defaultValue={category?.priceEgp ?? ""}
          required
        />
      </label>
      {category ? (
        <label
          className={`flex items-center gap-2 text-sm ${layout === "row" ? "" : "pb-3"}`}>
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category.isActive}
          />
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {category ? "Save" : "Add category"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
