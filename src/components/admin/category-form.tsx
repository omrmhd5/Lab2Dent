"use client";

import { useActionState } from "react";
import { createCategory, updateCategory } from "@/server/actions/categories";

type Category = {
  id: string;
  name: string;
  priceEgp: number;
  isActive: boolean;
  sortOrder: number;
};

export function CategoryForm({ category }: { category?: Category }) {
  const action = category ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
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
      <label className="space-y-1">
        <span className="block text-xs text-muted">Sort</span>
        <input
          className="ui-input w-20"
          name="sortOrder"
          type="number"
          defaultValue={category?.sortOrder ?? 0}
        />
      </label>
      {category ? (
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={category.isActive} />
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
      >
        {category ? "Save" : "Add category"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
