import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { CategoryAnalyticsSummary } from "@/components/admin/category-analytics-summary";
import { CategoryGroupDeleteButton } from "@/components/admin/category-group-delete-button";
import { CategoryManager } from "@/components/admin/category-manager";
import { categoryRecordToAnalytics } from "@/lib/category-analytics";
import { db } from "@/db";
import { categories, categoryFields } from "@/db/schema";
import { pickLocale } from "@/lib/bilingual";
import { getDash } from "@/i18n/dashboard";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import {
  isCategoryGroup,
  isSelectableCategory,
  type CategoryRecord,
} from "@/lib/categories";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const locale = await getLocale();
  const t = getDash(locale);
  const { id } = await params;

  const [group] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!group || !isCategoryGroup(group as CategoryRecord)) {
    notFound();
  }

  const children = await db
    .select()
    .from(categories)
    .where(eq(categories.parentId, id))
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const subcategories = children.filter((row) =>
    isSelectableCategory(row as CategoryRecord),
  );

  const fields =
    subcategories.length === 0
      ? []
      : await db
          .select()
          .from(categoryFields)
          .where(
            inArray(
              categoryFields.categoryId,
              subcategories.map((row) => row.id),
            ),
          )
          .orderBy(asc(categoryFields.sortOrder), asc(categoryFields.label));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard/categories" className="text-sm text-muted">
            {t.backToCategories}
          </Link>
          <CategoryGroupDeleteButton id={group.id} name={group.name} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {pickLocale(locale, group.name, group.nameAr)}
        </h1>
        <p className="mt-2 max-w-[55ch] text-sm text-muted">
          {t.categoryDetailIntro}
        </p>
      </div>
      <CategoryAnalyticsSummary
        title={t.thisCategory}
        stats={categoryRecordToAnalytics(group)}
      />
      <CategoryManager
        group={{
          id: group.id,
          parentId: group.parentId,
          name: group.name,
          nameAr: group.nameAr,
          priceEgp: group.priceEgp,
          costEgp: group.costEgp,
          confirmedOrderCount: group.confirmedOrderCount,
          confirmedTotalPriceEgp: group.confirmedTotalPriceEgp,
          confirmedTotalCostEgp: group.confirmedTotalCostEgp,
          confirmedTotalProfitEgp: group.confirmedTotalProfitEgp,
          isActive: group.isActive,
          sortOrder: group.sortOrder,
        }}
        subcategories={subcategories.map((row) => ({
          id: row.id,
          parentId: row.parentId,
          name: row.name,
          nameAr: row.nameAr,
          priceEgp: row.priceEgp,
          costEgp: row.costEgp,
          confirmedOrderCount: row.confirmedOrderCount,
          confirmedTotalPriceEgp: row.confirmedTotalPriceEgp,
          confirmedTotalCostEgp: row.confirmedTotalCostEgp,
          confirmedTotalProfitEgp: row.confirmedTotalProfitEgp,
          isActive: row.isActive,
          sortOrder: row.sortOrder,
        }))}
        fields={fields.map((field) => ({
          id: field.id,
          categoryId: field.categoryId,
          label: field.label,
          labelAr: field.labelAr,
          type: field.type,
          required: field.required,
        }))}
      />
    </div>
  );
}
