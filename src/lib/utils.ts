import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  value: Date | string,
  locale: "en" | "ar" = "en",
) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });
}

export function formatEgp(amount: number, locale: "en" | "ar" = "en") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.startsWith("20") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }

  return digits;
}

export function isEgyptianMobile(phone: string) {
  const normalized = normalizePhone(phone);
  return /^01[0125][0-9]{8}$/.test(normalized);
}
