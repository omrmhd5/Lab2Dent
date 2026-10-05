import type { Locale } from "@/lib/locale";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export type Dash = typeof en.dash & { locale: Locale };

export function fill(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export function getDash(locale: Locale): Dash {
  return { ...(locale === "ar" ? ar.dash : en.dash), locale };
}
