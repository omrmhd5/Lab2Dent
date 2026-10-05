import type { Locale } from "@/lib/locale";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export type SeoPageKey =
  | "home"
  | "newCase"
  | "track"
  | "trackCode"
  | "login"
  | "dashboard";

type SeoPageCopy = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  noIndex?: boolean;
};

type SeoRootCopy = {
  title: string;
  description: string;
  ogImageAlt: string;
  keywords: string[];
};

export type SeoCopy = {
  default: SeoRootCopy;
  pages: Record<SeoPageKey, SeoPageCopy>;
};

export function seoCopy(locale: Locale): SeoCopy {
  return (locale === "ar" ? ar.seo : en.seo) as SeoCopy;
}

export function fillSeo(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
