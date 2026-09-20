import Link from "next/link";
import type { Messages } from "@/i18n/messages";
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
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 text-[15px] font-semibold tracking-tight">
          {messages.brand}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/track"
            className="ui-press hidden whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted md:inline-flex"
          >
            {messages.navTrack}
          </Link>
          <Link
            href="/new-case"
            className="ui-press whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            {messages.navRegister}
          </Link>
          <ThemeToggle toLight={messages.themeToLight} toDark={messages.themeToDark} />
          <LanguageToggle locale={locale} />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-border px-4 py-6">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p className="max-w-[55ch]">{messages.footerNote}</p>
        <Link href="/login" className="ui-press">
          {messages.navStaff}
        </Link>
      </div>
    </footer>
  );
}
