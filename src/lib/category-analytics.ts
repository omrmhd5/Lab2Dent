import { isCategoryGroup, type CategoryRecord } from "@/lib/categories";
import type { CategoryAnalytics } from "@/components/admin/category-analytics-summary";

export function categoryRecordToAnalytics(
  row: Pick<
    CategoryRecord,
    | "confirmedOrderCount"
    | "confirmedTotalPriceEgp"
    | "confirmedTotalCostEgp"
    | "confirmedTotalProfitEgp"
  >,
): CategoryAnalytics {
  return {
    orderCount: row.confirmedOrderCount,
    totalPriceEgp: row.confirmedTotalPriceEgp,
    totalCostEgp: row.confirmedTotalCostEgp,
    totalProfitEgp: row.confirmedTotalProfitEgp,
  };
}

export function sumCategoryAnalytics(
  rows: CategoryRecord[],
): CategoryAnalytics {
  return rows.filter(isCategoryGroup).reduce(
    (totals, group) => ({
      orderCount: totals.orderCount + group.confirmedOrderCount,
      totalPriceEgp: totals.totalPriceEgp + group.confirmedTotalPriceEgp,
      totalCostEgp: totals.totalCostEgp + group.confirmedTotalCostEgp,
      totalProfitEgp: totals.totalProfitEgp + group.confirmedTotalProfitEgp,
    }),
    {
      orderCount: 0,
      totalPriceEgp: 0,
      totalCostEgp: 0,
      totalProfitEgp: 0,
    },
  );
}
