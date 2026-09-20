import type { OrderStatus } from "@/db/schema";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "sent_to_lab",
  "in_lab",
  "ready",
  "delivered",
  "rejected",
];

export const STATUS_LABELS: Record<OrderStatus, { en: string; ar: string }> = {
  pending: { en: "Pending payment review", ar: "بانتظار مراجعة التحويل" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  sent_to_lab: { en: "Sent to lab", ar: "أُرسل للمعمل" },
  in_lab: { en: "In lab", ar: "قيد التنفيذ في المعمل" },
  ready: { en: "Ready", ar: "جاهز" },
  delivered: { en: "Delivered", ar: "تم التسليم" },
  rejected: { en: "Rejected", ar: "مرفوض" },
};

export function statusLabel(status: OrderStatus, locale: "en" | "ar") {
  return STATUS_LABELS[status][locale];
}
