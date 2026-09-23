"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCategoryGroup,
  createSubcategory,
  updateCategoryGroup,
  updateSubcategory,
} from "@/server/actions/categories";
import type { CategoryRecord } from "@/lib/categories";
import { formatEgp } from "@/lib/utils";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function profitFrom(price: string, cost: string) {
  if (price === "" || cost === "") return null;
  return Number(price) - Number(cost);
}

export function CategoryGroupForm({
  group,
  layout = "default",
}: {
  group?: Pick<CategoryRecord, "id" | "name" | "isActive">;
  layout?: "default" | "row" | "stack";
}) {
  const action = group ? updateCategoryGroup : createCategoryGroup;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  if (layout === "row") {
    return (
      <div className="space-y-2">
        <form
          action={formAction}
          className="flex flex-nowrap items-center gap-2">
          {group ? <input type="hidden" name="id" value={group.id} /> : null}
          <input
            className="ui-input ui-input-grow"
            name="name"
            defaultValue={group?.name ?? ""}
            placeholder="Category name"
            aria-label="Category name"
            required
          />
          {group ? (
            <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={group.isActive}
              />
              Active
            </label>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {group ? "Save" : "Add category"}
          </button>
        </form>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={`flex gap-3 ${
        layout === "stack" ? "flex-col items-stretch" : "flex-wrap items-end"
      }`}>
      {group ? <input type="hidden" name="id" value={group.id} /> : null}
      <label className="space-y-1">
        <span className="block text-xs text-muted">Category name</span>
        <input
          className="ui-input min-w-48"
          name="name"
          defaultValue={group?.name ?? ""}
          placeholder="e.g. Crown"
          required
        />
      </label>
      {group ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={group.isActive}
          />
          Active
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {group ? "Save" : "Add category"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}

export function SubcategoryForm({
  parentId,
  subcategory,
  layout = "default",
  onSuccess,
}: {
  parentId: string;
  subcategory?: Pick<
    CategoryRecord,
    "id" | "name" | "priceEgp" | "costEgp" | "isActive"
  >;
  layout?: "default" | "row" | "compact" | "stack";
  onSuccess?: () => void;
}) {
  const action = subcategory ? updateSubcategory : createSubcategory;
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

  const [price, setPrice] = useState(
    subcategory?.priceEgp === null || subcategory?.priceEgp === undefined
      ? ""
      : String(subcategory.priceEgp),
  );
  const [cost, setCost] = useState(
    subcategory?.costEgp === null || subcategory?.costEgp === undefined
      ? ""
      : String(subcategory.costEgp),
  );
  const profit = profitFrom(price, cost);
  const isRow = layout === "row" || layout === "compact";

  if (isRow) {
    return (
      <div className="min-w-0 flex-1 space-y-2">
        <form
          action={formAction}
          className="flex w-full flex-nowrap items-center gap-2">
          <input type="hidden" name="parentId" value={parentId} />
          {subcategory ? (
            <input type="hidden" name="id" value={subcategory.id} />
          ) : null}
          <input
            className="ui-input ui-input-grow"
            name="name"
            defaultValue={subcategory?.name ?? ""}
            placeholder="Name"
            aria-label="Name"
            required
          />
          <input
            className="ui-input ui-input-price"
            name="priceEgp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={price}
            placeholder="Price"
            aria-label="Price EGP"
            onChange={(event) => setPrice(digitsOnly(event.target.value))}
            required
          />
          <input
            className="ui-input ui-input-price"
            name="costEgp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={cost}
            placeholder="Cost"
            aria-label="Cost EGP"
            onChange={(event) => setCost(digitsOnly(event.target.value))}
            required
          />
          <span
            className="shrink-0 whitespace-nowrap font-mono text-sm"
            aria-live="polite">
            {profit === null ? "Profit —" : `Profit ${formatEgp(profit)}`}
          </span>
          <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={subcategory?.isActive ?? true}
            />
            Active
          </label>
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {subcategory ? "Save" : "Add subcategory"}
          </button>
        </form>
        {state && "error" in state && state.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={`flex gap-3 ${
        layout === "stack" ? "flex-col items-stretch" : "flex-wrap items-end"
      }`}>
      <input type="hidden" name="parentId" value={parentId} />
      {subcategory ? (
        <input type="hidden" name="id" value={subcategory.id} />
      ) : null}
      <>
        <label className="space-y-1">
          <span className="block text-xs text-muted">Name</span>
          <input
            className={`ui-input ${layout === "stack" ? "w-full" : "min-w-40"}`}
            name="name"
            defaultValue={subcategory?.name ?? ""}
            placeholder="e.g. Zirconia"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs text-muted">Price EGP</span>
          <input
            className={`ui-input ${layout === "stack" ? "w-full" : "w-32"}`}
            name="priceEgp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={price}
            onChange={(event) => setPrice(digitsOnly(event.target.value))}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs text-muted">Cost EGP</span>
          <input
            className={`ui-input ${layout === "stack" ? "w-full" : "w-32"}`}
            name="costEgp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={cost}
            onChange={(event) => setCost(digitsOnly(event.target.value))}
            required
          />
        </label>
        <p className="text-sm font-mono">
          {profit === null ? "Profit —" : `Profit ${formatEgp(profit)}`}
        </p>
        {subcategory ? (
          <label
            className={`flex items-center gap-2 text-sm ${
              layout === "stack" ? "" : "pb-3"
            }`}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={subcategory.isActive}
            />
            Active
          </label>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="ui-press ui-btn ui-btn-primary">
          {subcategory ? "Save" : "Add subcategory"}
        </button>
      </>
      {state && "error" in state && state.error ? (
        <p className="w-full basis-full text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
