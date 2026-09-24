import type { Metadata } from "next";
import Image from "next/image";
import { CaseForm } from "@/components/case-form";
import { Rise } from "@/components/rise";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { universities } from "@/db/schema";
import { listPublicCategoryGroups } from "@/server/actions/categories";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { buildPageMetadata } from "@/lib/seo";
import { getInstapayConfig } from "@/lib/settings";
import { asc, eq } from "drizzle-orm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildPageMetadata(locale, "newCase");
}

export default async function NewCasePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  const instapay = await getInstapayConfig();

  let categoryGroups: Awaited<ReturnType<typeof listPublicCategoryGroups>> = [];
  let universityRows: { id: string; name: string; nameAr: string | null }[] =
    [];
  try {
    categoryGroups = await listPublicCategoryGroups();
  } catch {
    categoryGroups = [];
  }

  try {
    universityRows = await db
      .select({
        id: universities.id,
        name: universities.name,
        nameAr: universities.nameAr,
      })
      .from(universities)
      .where(eq(universities.isActive, true))
      .orderBy(asc(universities.sortOrder), asc(universities.name));
  } catch {
    universityRows = [];
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main
        id="main"
        className="mx-auto grid w-full max-w-[1200px] flex-1 items-start gap-10 px-4 py-10 sm:px-6 md:grid-cols-12 md:py-14">
        <Rise className="md:col-span-7">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
            {messages.heroEyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            {messages.navRegister}
          </h1>
          <div className="ui-card mt-8 overflow-visible">
            <CaseForm
              locale={locale}
              messages={messages}
              categoryGroups={categoryGroups}
              universities={universityRows}
              instapay={instapay}
            />
          </div>
        </Rise>
        <Rise
          delay={0.08}
          className="photo-frame photo-enter relative hidden min-h-[32rem] overflow-hidden rounded-[1.75rem] bg-brand-soft shadow-[var(--shadow-lg)] md:col-span-5 md:block">
          <Image
            src="/work.jpg"
            alt={messages.workAlt}
            fill
            priority
            loading="eager"
            className="object-cover"
            sizes="40vw"
          />
        </Rise>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
