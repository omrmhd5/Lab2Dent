import Image from "next/image";
import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { formatEgp } from "@/lib/utils";

async function loadPrices() {
  try {
    return await db
      .select({
        id: categories.id,
        name: categories.name,
        priceEgp: categories.priceEgp,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const prices = await loadPrices();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main>
        <section className="mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 pb-16 pt-10 md:grid-cols-2 md:gap-16 md:pt-14">
          <div>
            <h1 className="max-w-[13ch] text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              {messages.heroTitle}
            </h1>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted md:text-lg">
              {messages.heroBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/new-case"
                className="ui-press rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
              >
                {messages.navRegister}
              </Link>
              <Link
                href="/track"
                className="ui-press rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium"
              >
                {messages.navTrack}
              </Link>
            </div>
          </div>
          <div className="photo-frame relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-accent-soft">
            <Image
              src="/hero.jpg"
              alt={messages.heroAlt}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-20">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {messages.pricesTitle}
            </h2>
            {prices.length === 0 ? (
              <p className="mt-6 max-w-[50ch] text-muted">{messages.pricesEmpty}</p>
            ) : (
              <ul className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
                {prices.map((item) => (
                  <li key={item.id}>
                    <p className="text-lg font-medium">{item.name}</p>
                    <p className="mt-1 font-mono text-2xl tracking-tight">
                      {formatEgp(item.priceEgp, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-end md:py-24">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {messages.howTitle}
            </h2>
            <ol className="mt-10 space-y-8">
              {[
                [messages.how1Title, messages.how1Body],
                [messages.how2Title, messages.how2Body],
                [messages.how3Title, messages.how3Body],
              ].map(([title, body], index) => (
                <Reveal key={title} delay={index * 0.05}>
                  <p className="text-lg font-medium">{title}</p>
                  <p className="mt-1 max-w-[50ch] text-muted">{body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="photo-frame relative aspect-[4/3] overflow-hidden rounded-2xl bg-accent-soft">
            <Image
              src="/work.jpg"
              alt={messages.workAlt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </section>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
