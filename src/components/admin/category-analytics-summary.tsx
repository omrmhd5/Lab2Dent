"use client";

import { useDash } from "@/components/dashboard-i18n";
import { formatEgp } from "@/lib/utils";

export type CategoryAnalytics = {
  orderCount: number;
  totalPriceEgp: number;
  totalCostEgp: number;
  totalProfitEgp: number;
};

export function CategoryAnalyticsSummary({
  title,
  stats,
}: {
  title: string;
  stats: CategoryAnalytics;
}) {
  const t = useDash();
  const items = [
    { label: t.confirmedOrders, value: String(stats.orderCount) },
    { label: t.totalPrices, value: formatEgp(stats.totalPriceEgp) },
    { label: t.totalCosts, value: formatEgp(stats.totalCostEgp) },
    { label: t.totalProfit, value: formatEgp(stats.totalProfitEgp) },
  ];

  return (
    <div className="ui-card h-full">
      <h2 className="text-sm font-bold">{title}</h2>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs text-muted sm:text-sm">{item.label}</dt>
            <dd className="mt-1 break-words font-mono text-base font-bold leading-tight sm:text-2xl">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
