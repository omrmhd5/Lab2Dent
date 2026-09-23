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
  const items = [
    { label: "Confirmed orders", value: String(stats.orderCount) },
    { label: "Total prices", value: formatEgp(stats.totalPriceEgp) },
    { label: "Total costs", value: formatEgp(stats.totalCostEgp) },
    { label: "Total profit", value: formatEgp(stats.totalProfitEgp) },
  ];

  return (
    <div className="ui-card h-full">
      <h2 className="text-sm font-bold">{title}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="mt-1 font-mono text-2xl font-bold tracking-tight">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
