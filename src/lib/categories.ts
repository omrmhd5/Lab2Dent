export type CategoryRecord = {
  id: string;
  parentId: string | null;
  name: string;
  priceEgp: number | null;
  costEgp: number | null;
  confirmedOrderCount: number;
  confirmedTotalPriceEgp: number;
  confirmedTotalCostEgp: number;
  confirmedTotalProfitEgp: number;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryFieldDef = {
  id: string;
  label: string;
  type: "text" | "image";
  required: boolean;
};

export type CategoryGroup = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    priceEgp: number;
    fields: CategoryFieldDef[];
  }[];
};

export function isCategoryGroup(row: CategoryRecord) {
  return row.parentId === null && row.priceEgp === null;
}

export function isSelectableCategory(row: CategoryRecord) {
  return row.priceEgp !== null;
}

export function formatCategoryLabel(
  row: CategoryRecord,
  parent?: CategoryRecord | null,
) {
  if (parent && isCategoryGroup(parent)) {
    return `${parent.name} — ${row.name}`;
  }
  return row.name;
}

export function buildCategoryGroups(
  rows: CategoryRecord[],
  fieldsByCategory: Map<string, CategoryFieldDef[]> = new Map(),
): CategoryGroup[] {
  const parents = rows
    .filter(isCategoryGroup)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  const childrenByParent = new Map<string, CategoryRecord[]>();
  const legacyItems: CategoryRecord[] = [];

  for (const row of rows) {
    if (!isSelectableCategory(row)) continue;
    if (row.parentId) {
      const list = childrenByParent.get(row.parentId) ?? [];
      list.push(row);
      childrenByParent.set(row.parentId, list);
    } else {
      legacyItems.push(row);
    }
  }

  const groups: CategoryGroup[] = parents.map((parent) => ({
    id: parent.id,
    name: parent.name,
    items: (childrenByParent.get(parent.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        priceEgp: item.priceEgp!,
        fields: fieldsByCategory.get(item.id) ?? [],
      })),
  }));

  if (legacyItems.length > 0) {
    groups.push({
      id: "legacy",
      name: "Other",
      items: legacyItems
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
          priceEgp: item.priceEgp!,
          fields: fieldsByCategory.get(item.id) ?? [],
        })),
    });
  }

  return groups.filter((group) => group.items.length > 0);
}

export function flattenSelectableItems(groups: CategoryGroup[]) {
  return groups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupId: group.id,
      groupName: group.name,
    })),
  );
}
