import type { OrderStatus } from "@/db/schema";
import { STATUS_LABELS, statusBadgeClass } from "@/lib/status";

export function OrderStatusPill({
  status,
  className = "",
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${statusBadgeClass(status)} ${className}`}>
      {STATUS_LABELS[status].en}
    </span>
  );
}
