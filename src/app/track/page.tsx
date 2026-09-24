import { Rise } from "@/components/rise";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { TrackForm } from "@/components/track-form";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";

export default async function TrackPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main
        id="main"
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-6 md:py-16">
        <Rise className="mx-auto max-w-xl">
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
        </Rise>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
