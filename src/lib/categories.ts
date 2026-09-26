import { pickLocale } from "@/lib/bilingual";
import type { Locale } from "@/lib/locale";

export type CategoryRecord = {
  id: string;
  parentId: string | null;
  name: string;
  nameAr: string | null;
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
  labelAr: string | null;
  type: "text" | "number" | "image" | "price";
  required: boolean;
  priceEgp: number | null;
};

export function sumSelectedPriceFieldAddons(
  fields: CategoryFieldDef[],
  selectedFieldIds: Set<string>,
) {
  return fields.reduce((total, field) => {
    if (field.type !== "price" || !selectedFieldIds.has(field.id)) return total;
    return total + (field.priceEgp ?? 0);
  }, 0);
}

export type CategoryGroup = {
  id: string;
  name: string;
  nameAr: string | null;
  items: {
    id: string;
    name: string;
    nameAr: string | null;
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

export function formatCategoryLabelForLocale(
  locale: Locale,
  row: CategoryRecord,
  parent?: CategoryRecord | null,
) {
  if (parent && isCategoryGroup(parent)) {
    return `${pickLocale(locale, parent.name, parent.nameAr)} — ${pickLocale(locale, row.name, row.nameAr)}`;
  }
  return pickLocale(locale, row.name, row.nameAr);
}

export function formatCategoryNames(
  row: CategoryRecord,
  parent?: CategoryRecord | null,
) {
  const english = formatCategoryLabel(row, parent);
  const arabic = formatCategoryLabelForLocale("ar", row, parent);
  return { english, arabic };
}

export function pickOrderCategoryLabel(
  locale: Locale,
  order: {
    categoryName: string;
    categoryNameAr: string | null;
  },
  category?: CategoryRecord | null,
  parent?: CategoryRecord | null,
) {
  if (locale === "en") return order.categoryName;
  if (order.categoryNameAr?.trim()) return order.categoryNameAr;
  if (category) return formatCategoryLabelForLocale(locale, category, parent);
  return order.categoryName;
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
    nameAr: parent.nameAr,
    items: (childrenByParent.get(parent.id) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((item) => ({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        priceEgp: item.priceEgp!,
        fields: fieldsByCategory.get(item.id) ?? [],
      })),
  }));

  if (legacyItems.length > 0) {
    groups.push({
      id: "legacy",
      name: "Other",
      nameAr: "أخرى",
      items: legacyItems
        .sort(
          (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
        )
        .map((item) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          priceEgp: item.priceEgp!,
          fields: fieldsByCategory.get(item.id) ?? [],
        })),
    });
  }

  return groups.filter((group) => group.items.length > 0);
}

export function localizeGroups(groups: CategoryGroup[], locale: Locale) {
  return groups.map((group) => ({
    ...group,
    name: pickLocale(locale, group.name, group.nameAr),
    items: group.items.map((item) => ({
      ...item,
      name: pickLocale(locale, item.name, item.nameAr),
      fields: item.fields.map((field) => ({
        id: field.id,
        label: pickLocale(locale, field.label, field.labelAr),
        labelAr: field.labelAr,
        type: field.type,
        required: field.required,
        priceEgp: field.priceEgp,
      })),
    })),
  }));
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
