import type { Metadata, Viewport } from "next";
import Script from "next/script";
import {
  Atkinson_Hyperlegible,
  Geist_Mono,
  Noto_Sans_Arabic,
} from "next/font/google";
import { Toaster } from "@/components/toast";
import { getLocale } from "@/lib/locale";
import { buildRootMetadata } from "@/lib/seo";
import { getTheme, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildRootMetadata(locale);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#133563" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1730" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const theme = await getTheme();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${atkinson.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
      suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <Script id="lab2dent-theme" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
