import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  IdentificationCard,
  Truck,
  Wallet,
} from "@phosphor-icons/react/ssr";
import { BrandLockup } from "@/components/brand-mark";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { Rise } from "@/components/rise";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { listPublicCategoryGroups } from "@/server/actions/categories";

async function loadPrices() {
  try {
    return await listPublicCategoryGroups();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const prices = await loadPrices();
  const steps = [
    {
      icon: IdentificationCard,
      title: messages.how1Title,
      body: messages.how1Body,
    },
    { icon: Wallet, title: messages.how2Title, body: messages.how2Body },
    { icon: Truck, title: messages.how3Title, body: messages.how3Body },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main id="main">
        <section className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center px-4 py-16 sm:px-6">
          <div className="flex w-full max-w-md flex-col items-center">
            <Rise spring>
              <BrandLockup label={messages.brand} slogan={messages.slogan} />
            </Rise>
            <Rise delay={0.08} className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/new-case"
                className="ui-press ui-btn ui-btn-primary w-full">
                {messages.navRegister}
              </Link>
              <Link
                href="/track"
                className="ui-press ui-btn ui-btn-secondary w-full">
                {messages.navTrack}
              </Link>
            </Rise>
          </div>
        </section>

        <section className="border-y border-border">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 md:py-20">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
              {messages.heroEyebrow}
            </p>
            <h2 className="mt-3 max-w-[16ch] text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {messages.slogan}
            </h2>
            <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-muted">
              {messages.heroBody}
            </p>
            <ul className="mt-6 flex max-w-3xl flex-col gap-2.5 text-sm text-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
              {[
                messages.trustNoAccount,
                messages.trustInstapay,
                messages.trustCode,
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="mt-14 text-2xl font-bold tracking-tight md:text-3xl">
              {messages.proofTitle}
            </h3>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={index * 0.06}>
                    <li className="ui-card h-full space-y-4">
                      <span className="flex items-center justify-between">
                        <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                          <Icon size={22} weight="bold" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-sm text-muted">
                          0{index + 1}
                        </span>
                      </span>
                      <p className="text-xl font-bold">{step.title}</p>
                      <p className="max-w-[36ch] leading-relaxed text-muted">
                        {step.body}
                      </p>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {messages.pricesTitle}
          </h2>
          {prices.length === 0 ? (
            <div className="ui-card mt-8 max-w-xl">
              <p className="text-muted">{messages.pricesEmpty}</p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prices.map((group, index) => (
                <li key={group.id}>
                  <Reveal delay={index * 0.04}>
                    <article className="ui-card ui-card-hover flex h-full flex-col gap-6">
                      <p className="text-xl font-bold">{group.name}</p>
                      <Link
                        href="/new-case"
                        className="ui-press ui-btn ui-btn-secondary mt-auto w-full">
                        {messages.navRegister}
                      </Link>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border-t border-border bg-brand-soft">
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-12 md:py-20">
            <div className="md:col-span-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {messages.howTitle}
              </h2>
              <div className="mt-8 space-y-6">
                {steps.map((step) => (
                  <div key={step.title}>
                    <p className="text-lg font-bold">{step.title}</p>
                    <p className="mt-1 max-w-[48ch] text-muted">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="photo-frame relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-surface shadow-[var(--shadow-lg)] md:col-span-6">
              <Image
                src="/work.jpg"
                alt={messages.workAlt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </section>

        <section className="bg-brand-solid text-on-brand">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {messages.bandTitle}
              </h2>
              <p className="mt-3 max-w-[46ch] text-on-brand/85">
                {messages.bandBody}
              </p>
            </div>
            <Link
              href="/new-case"
              className="ui-press ui-btn ui-btn-primary min-h-12">
              {messages.navRegister}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
