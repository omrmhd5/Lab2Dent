import type { Metadata } from "next";
import Link from "next/link";
import { Rise } from "@/components/rise";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { TrackForm } from "@/components/track-form";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import { statusLabel } from "@/lib/status";

const demoCodes = [
  { code: "L2D-DEMOA2", status: "pending" },
  { code: "L2D-DEMOB3", status: "confirmed" },
  { code: "L2D-DEMOC4", status: "sent_to_lab" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata(locale, "track");
}

export default async function TrackPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main
        id="main"
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-6 md:py-16">
        <div id="track-stack" className="mx-auto max-w-xl">
        <Rise>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            {messages.trustCode}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            {messages.trackTitle}
          </h1>
          <p className="mt-4 max-w-[40ch] text-lg text-muted">
            {messages.trackHint}
          </p>
          <div className="ui-card mt-10">
            <TrackForm messages={messages} />
          </div>
          <aside className="mt-6 rounded-2xl border border-dashed border-border bg-brand-soft/50 px-4 py-4">
            <p className="text-sm font-bold">{messages.demoTrackTitle}</p>
            <p className="mt-1 text-sm text-muted">{messages.demoTrackHint}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {demoCodes.map((item) => (
                <li key={item.code}>
                  <Link
                    href={`/track/${item.code}`}
                    className="ui-press flex items-baseline justify-between gap-3">
                    <span className="font-mono font-bold">{item.code}</span>
                    <span className="text-muted">
                      {statusLabel(item.status, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </Rise>
        </div>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
