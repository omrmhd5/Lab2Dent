import type { Locale } from "@/lib/locale";

export function pickLocale(
  locale: Locale,
  english: string,
  arabic?: string | null,
) {
  const ar = arabic?.trim();
  if (locale === "ar" && ar) return ar;
  return english;
}

export function readLocalizedPair(
  formData: FormData,
  englishKey: string,
  arabicKey: string,
) {
  return {
    english: String(formData.get(englishKey) ?? "").trim(),
    arabic: String(formData.get(arabicKey) ?? "").trim(),
  };
}
