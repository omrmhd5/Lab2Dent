"use client";

import { useActionState, useEffect, useState } from "react";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";
import {
  createCategoryGroup,
  createSubcategory,
  updateCategoryGroup,
  updateSubcategory,
} from "@/server/actions/categories";
import type { CategoryRecord } from "@/lib/categories";
import { fill } from "@/i18n/dashboard";
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
  group?: Pick<CategoryRecord, "id" | "name" | "nameAr" | "isActive">;
  layout?: "default" | "row" | "stack";
}) {
  const t = useDash();
  const action = group ? updateCategoryGroup : createCategoryGroup;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    reportAction(state, group ? t.categorySaved : t.categoryAdded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (layout === "row") {
    return (
      <div className="space-y-2">
        <form
          action={formAction}
          className="flex flex-wrap items-center gap-2">
          {group ? <input type="hidden" name="id" value={group.id} /> : null}
          <input
            className="ui-input ui-input-grow"
            name="name"
            defaultValue={group?.name ?? ""}
            placeholder={t.english}
            aria-label={t.english}
            required
          />
          <input
            className="ui-input ui-input-grow"
            name="nameAr"
            dir="rtl"
            defaultValue={group?.nameAr ?? ""}
            placeholder={t.arabic}
            aria-label={t.arabic}
            required
          />
          {group ? (
            <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={group.isActive}
              />
              {t.active}
            </label>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {pending ? <Spinner /> : null}
            {group ? t.save : t.addCategory}
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
        <span className="block text-xs text-muted">{t.english}</span>
        <input
          className="ui-input min-w-48"
          name="name"
          defaultValue={group?.name ?? ""}
          placeholder="Crown"
          required
        />
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted">{t.arabic}</span>
        <input
          className="ui-input min-w-48"
          name="nameAr"
          dir="rtl"
          defaultValue={group?.nameAr ?? ""}
          placeholder="تاج"
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
          {t.active}
        </label>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {pending ? <Spinner /> : null}
        {group ? t.save : t.addCategory}
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
    "id" | "name" | "nameAr" | "priceEgp" | "costEgp" | "isActive"
  >;
  layout?: "default" | "row" | "compact" | "stack";
  onSuccess?: () => void;
}) {
  const t = useDash();
  const action = subcategory ? updateSubcategory : createSubcategory;
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return action(formData);
    },
    undefined,
  );

  useEffect(() => {
    if (!state) return;
    reportAction(
      state,
      subcategory ? t.subcategorySaved : t.subcategoryAdded,
    );
    if ("ok" in state && state.ok) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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
            placeholder={t.english}
            aria-label={t.english}
            required
          />
          <input
            className="ui-input ui-input-grow"
            name="nameAr"
            dir="rtl"
            defaultValue={subcategory?.nameAr ?? ""}
            placeholder={t.arabic}
            aria-label={t.arabic}
            required
          />
          <input
            className="ui-input ui-input-price"
            name="priceEgp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]+"
            value={price}
            placeholder={t.price}
            aria-label={t.priceEgp}
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
            placeholder={t.cost}
            aria-label={t.costEgp}
            onChange={(event) => setCost(digitsOnly(event.target.value))}
            required
          />
          <span
            className="shrink-0 whitespace-nowrap font-mono text-sm"
            aria-live="polite">
            {profit === null
              ? t.profitDash
              : fill(t.profitValue, { amount: formatEgp(profit) })}
          </span>
          <label className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={subcategory?.isActive ?? true}
            />
            {t.active}
          </label>
          <button
            type="submit"
            disabled={pending}
            className="ui-press ui-btn ui-btn-primary ui-btn-sm shrink-0">
            {pending ? <Spinner /> : null}
            {subcategory ? t.save : t.addSubcategory}
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
          <span className="block text-xs text-muted">{t.english}</span>
          <input
            className={`ui-input ${layout === "stack" ? "w-full" : "min-w-40"}`}
            name="name"
            defaultValue={subcategory?.name ?? ""}
            placeholder="Zirconia"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs text-muted">{t.arabic}</span>
          <input
            className={`ui-input ${layout === "stack" ? "w-full" : "min-w-40"}`}
            name="nameAr"
            dir="rtl"
            defaultValue={subcategory?.nameAr ?? ""}
            placeholder="زركونيا"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs text-muted">{t.priceEgp}</span>
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
          <span className="block text-xs text-muted">{t.costEgp}</span>
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
          {profit === null
            ? t.profitDash
            : fill(t.profitValue, { amount: formatEgp(profit) })}
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
            {t.active}
          </label>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="ui-press ui-btn ui-btn-primary">
          {pending ? <Spinner /> : null}
          {subcategory ? t.save : t.addSubcategory}
        </button>
      </>
      {state && "error" in state && state.error ? (
        <p className="w-full basis-full text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
