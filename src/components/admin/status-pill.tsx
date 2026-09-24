import type { OrderStatus } from "@/db/schema";
import { statusBadgeClass, statusLabel } from "@/lib/status";

export function OrderStatusPill({
  status,
  labName,
  locale = "en",
  className = "",
}: {
  status: OrderStatus;
  labName?: string | null;
  locale?: "en" | "ar";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${statusBadgeClass(status)} ${className}`}>
      {statusLabel(status, locale, labName)}
    </span>
  );
}
