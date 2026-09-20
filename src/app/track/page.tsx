import { SiteFooter, SiteHeader } from "@/components/site-header";
import { TrackForm } from "@/components/track-form";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";

export default async function TrackPage() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 md:py-14">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {messages.trackTitle}
          </h1>
          <p className="mt-4 max-w-[40ch] text-lg text-muted">{messages.trackHint}</p>
          <TrackForm messages={messages} />
        </div>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
