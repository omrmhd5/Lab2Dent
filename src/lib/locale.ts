import { cookies, headers } from "next/headers";

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "lab2dent-locale";

function parseLocale(value: string | null | undefined): Locale | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.startsWith("ar")) return "ar";
  if (normalized.startsWith("en")) return "en";
  return null;
}

export async function getLocale(): Promise<Locale> {
  const headerStore = await headers();
  const explicit = parseLocale(headerStore.get("x-language"));
  if (explicit) return explicit;

  const store = await cookies();
  const saved = parseLocale(store.get(LOCALE_COOKIE)?.value);
  if (saved) return saved;

  const accept = headerStore.get("accept-language") ?? "";
  return accept.toLowerCase().includes("ar") ? "ar" : "en";
}
