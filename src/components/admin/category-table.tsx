"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  isCategoryGroup,
  isSelectableCategory,
  type CategoryRecord,
} from "@/lib/categories";

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

export function CategoryTable({ initial }: { initial: CategoryRecord[] }) {
  const [rows, setRows] = useState(initial);
  const signature = initial
    .map(
      (row) =>
        `${row.id}:${row.name}:${row.priceEgp}:${row.costEgp}:${row.isActive}`,
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
    <div className="rounded-2xl border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Subcategories</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-muted">
                No categories yet. Add one above.
              </td>
            </tr>
          ) : (
            groups.map((group) => {
              const count = childrenByParent.get(group.id)?.length ?? 0;
              return (
                <tr
                  key={group.id}
                  className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bold">{group.name}</td>
                  <td className="px-4 py-3">{count}</td>
                  <td className="px-4 py-3">
                    <StatusPill active={group.isActive} />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      href={`/admin/categories/${group.id}`}
                      className="ui-press ui-btn ui-btn-secondary ui-btn-sm">
                      View
                    </Link>
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
