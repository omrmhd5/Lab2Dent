import type { OrderStatus, StaffRole } from "@/db/schema";

export const WORKFLOW_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "sent_to_lab",
  "rejected",
  "ready",
];

export const ORDER_STATUSES = WORKFLOW_STATUSES;

export const STATUS_LABELS: Record<OrderStatus, { en: string; ar: string }> = {
  pending: { en: "Pending payment", ar: "بانتظار مراجعة الدفع" },
  confirmed: { en: "Confirmed payment", ar: "تم تأكيد الدفع" },
  sent_to_lab: { en: "Assigned to lab", ar: "مُسند للمعمل" },
  in_lab: { en: "Assigned to lab", ar: "مُسند للمعمل" },
  ready: { en: "Ready", ar: "جاهز" },
  delivered: { en: "Ready", ar: "جاهز" },
  rejected: { en: "Rejected", ar: "مرفوض" },
};

export function statusesForRole(role: StaffRole): OrderStatus[] {
  if (role === "admin") {
    return ["pending", "confirmed", "rejected"];
  }
  if (role === "employee") {
    return ["confirmed", "rejected"];
  }
  return ["ready"];
}

/** Statuses a user may pick when the order is already at `current`. */
export function selectableStatuses(
  allowed: OrderStatus[],
  current: OrderStatus,
): OrderStatus[] {
  return allowed.filter((status) => status !== current);
}

/** Bulk update: hide statuses every selected order already has. */
export function selectableStatusesForOrders(
  allowed: OrderStatus[],
  orders: { status: OrderStatus }[],
): OrderStatus[] {
  if (orders.length === 0) return allowed;
  return allowed.filter(
    (status) => !orders.every((order) => order.status === status),
  );
}

export function statusLabel(
  status: OrderStatus,
  locale: "en" | "ar",
  labName?: string | null,
) {
  if ((status === "sent_to_lab" || status === "in_lab") && labName) {
    return locale === "ar" ? `مُسند إلى ${labName}` : `Assigned to ${labName}`;
  }
  return STATUS_LABELS[status][locale];
}

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  confirmed: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  sent_to_lab: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  in_lab: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  ready: "bg-accent-soft text-accent",
  delivered: "bg-accent-soft text-accent",
  rejected: "bg-danger/10 text-danger",
};

const STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  sent_to_lab: "bg-violet-500",
  in_lab: "bg-violet-500",
  ready: "bg-accent",
  delivered: "bg-accent",
  rejected: "bg-danger",
};

export function statusBadgeClass(status: OrderStatus) {
  return STATUS_BADGE_CLASSES[status];
}

export function statusDotClass(status: OrderStatus) {
  return STATUS_DOT_CLASSES[status];
}
