import Link from "next/link";
import type { Messages } from "@/i18n/messages";
import { BrandMark } from "./brand-mark";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({
  locale,
  messages,
}: {
  locale: "en" | "ar";
  messages: Messages;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        {messages.skipToContent}
      </a>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-3 sm:px-6 md:h-[72px] md:flex-row md:items-center md:justify-between md:py-0">
          <div className="flex items-center justify-between gap-2">
            <BrandMark label={messages.brand} />
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle
                toLight={messages.themeToLight}
                toDark={messages.themeToDark}
              />
              <LanguageToggle locale={locale} />
            </div>
          </div>
          <nav className="flex items-center gap-1.5">
            <Link
              href="/track"
              className="ui-press inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-3 text-sm font-bold text-muted md:flex-none">
              {messages.navTrack}
            </Link>
            <Link
              href="/new-case"
              className="ui-press ui-btn ui-btn-primary flex-1 justify-center md:flex-none">
              {messages.navRegister}
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              <ThemeToggle
                toLight={messages.themeToLight}
                toDark={messages.themeToDark}
              />
              <LanguageToggle locale={locale} />
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <BrandMark label={messages.brand} />
          <p className="max-w-[48ch] text-sm leading-relaxed text-muted">
            {messages.footerNote}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
          <Link href="/new-case" className="ui-press">
            {messages.navRegister}
          </Link>
          <Link href="/track" className="ui-press">
            {messages.navTrack}
          </Link>
          <Link href="/dashboard" className="ui-press">
            {messages.navStaff}
          </Link>
        </div>
      </div>
    </footer>
  );
}
