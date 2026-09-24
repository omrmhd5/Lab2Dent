import type { Metadata } from "next";
import type { Locale } from "@/lib/locale";
import { fillSeo, seoCopy, type SeoPageKey } from "@/i18n/seo";

export const SITE_NAME = "Lab2Dent";

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function openGraphLocale(locale: Locale) {
  return locale === "ar" ? "ar_EG" : "en_US";
}

function alternateOpenGraphLocale(locale: Locale) {
  return locale === "ar" ? "en_US" : "ar_EG";
}

type PageMetadataOptions = {
  path?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata(
  locale: Locale,
  page: SeoPageKey,
  options: PageMetadataOptions = {},
): Metadata {
  const siteUrl = getSiteUrl();
  const pageCopy = seoCopy[locale].pages[page];
  const title = options.title ?? pageCopy.title;
  const description = options.description ?? pageCopy.description;
  const path = options.path ?? pageCopy.path;
  const keywords = options.keywords ?? pageCopy.keywords;
  const noIndex = options.noIndex ?? pageCopy.noIndex ?? false;
  const url = `${siteUrl}${path}`;

  const metadata: Metadata = {
    title: page === "home" ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      alternateLocale: [alternateOpenGraphLocale(locale)],
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    };
  }

  return metadata;
}

export function buildRootMetadata(locale: Locale): Metadata {
  const copy = seoCopy[locale].default;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: copy.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: copy.description,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: copy.keywords,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: openGraphLocale(locale),
      alternateLocale: [alternateOpenGraphLocale(locale)],
      siteName: SITE_NAME,
      title: copy.title,
      description: copy.description,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: "/Logo.svg",
      apple: "/Logo.svg",
      shortcut: "/Logo.svg",
    },
    other: {
      "og:image:alt": copy.ogImageAlt,
    },
  };
}

export function buildTrackCodeMetadata(locale: Locale, code: string): Metadata {
  const pageCopy = seoCopy[locale].pages.trackCode;

  return buildPageMetadata(locale, "trackCode", {
    path: `/track/${encodeURIComponent(code)}`,
    title: fillSeo(pageCopy.title, { code }),
  });
}
