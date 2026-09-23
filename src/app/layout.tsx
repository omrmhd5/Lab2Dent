import type { Metadata } from "next";
import Script from "next/script";
import { Atkinson_Hyperlegible, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { getLocale } from "@/lib/locale";
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

export const metadata: Metadata = {
  title: "Lab2Dent",
  description: "We handle the rest — register a dental lab case, pay with Instapay, and track it with a code.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const theme = await getTheme();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${atkinson.variable} ${geistMono.variable} ${notoArabic.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground">
        <Script id="lab2dent-theme" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
