"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CategoryGroupDeleteButton } from "@/components/admin/category-group-delete-button";
import { useDash } from "@/components/dashboard-i18n";
import { pickLocale } from "@/lib/bilingual";
import {
  isCategoryGroup,
  isSelectableCategory,
  type CategoryRecord,
} from "@/lib/categories";
import { formatEgp } from "@/lib/utils";

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

export function CategoryTable({ initial }: { initial: CategoryRecord[] }) {
  const t = useDash();
  const [rows, setRows] = useState(initial);
  const signature = initial
    .map(
      (row) =>
        `${row.id}:${row.name}:${row.priceEgp}:${row.costEgp}:${row.confirmedOrderCount}:${row.confirmedTotalPriceEgp}:${row.confirmedTotalCostEgp}:${row.confirmedTotalProfitEgp}:${row.isActive}`,
    )
    .join("|");

  useEffect(() => {
    setRows(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- signature tracks server list changes
  }, [signature]);

  const groups = useMemo(
    () =>
      rows
        .filter(isCategoryGroup)
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        ),
    [rows],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryRecord[]>();
    for (const row of rows) {
      if (!row.parentId || !isSelectableCategory(row)) continue;
      const list = map.get(row.parentId) ?? [];
      list.push(row);
      map.set(row.parentId, list);
    }
    return map;
  }, [rows]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">{t.category}</th>
            <th className="px-4 py-3 font-medium">{t.subcategories}</th>
            <th className="px-4 py-3 font-medium">{t.ordersColumn}</th>
            <th className="px-4 py-3 font-medium">{t.totalPrices}</th>
            <th className="px-4 py-3 font-medium">{t.totalCosts}</th>
            <th className="px-4 py-3 font-medium">{t.totalProfit}</th>
            <th className="px-4 py-3 font-medium">{t.status}</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">{t.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-muted">
                {t.noCategoriesYet}
              </td>
            </tr>
          ) : (
            groups.map((group) => {
              const count = childrenByParent.get(group.id)?.length ?? 0;
              return (
                <tr
                  key={group.id}
                  className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bold">
                    {pickLocale(t.locale, group.name, group.nameAr)}
                  </td>
                  <td className="px-4 py-3">{count}</td>
                  <td className="px-4 py-3 font-mono">
                    {group.confirmedOrderCount}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatEgp(group.confirmedTotalPriceEgp)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatEgp(group.confirmedTotalCostEgp)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatEgp(group.confirmedTotalProfitEgp)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill active={group.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/dashboard/categories/${group.id}`}
                        className="ui-press ui-btn ui-btn-secondary ui-btn-sm">
                        {t.view}
                      </Link>
                      <CategoryGroupDeleteButton
                        id={group.id}
                        name={group.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
