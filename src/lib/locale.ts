import { cookies } from "next/headers";

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "lab2dent-locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}
