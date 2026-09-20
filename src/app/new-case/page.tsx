import Image from "next/image";
import { CaseForm } from "@/components/case-form";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { categories, universities } from "@/db/schema";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { asc, eq } from "drizzle-orm";

export default async function NewCasePage() {
  const locale = await getLocale();
  const messages = getMessages(locale);

  let universityRows: { id: string; name: string }[] = [];
  let categoryRows: { id: string; name: string; priceEgp: number }[] = [];
  try {
    [universityRows, categoryRows] = await Promise.all([
      db
        .select({ id: universities.id, name: universities.name })
        .from(universities)
        .orderBy(asc(universities.sortOrder)),
      db
        .select({
          id: categories.id,
          name: categories.name,
          priceEgp: categories.priceEgp,
        })
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder), asc(categories.name)),
    ]);
  } catch {
    universityRows = [];
    categoryRows = [];
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main className="mx-auto grid w-full max-w-[1400px] flex-1 items-start gap-12 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] md:py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {messages.navRegister}
          </h1>
          <div className="mt-10">
            <CaseForm
              locale={locale}
              messages={messages}
              universities={universityRows}
              categories={categoryRows}
              instapayHandle={
                process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || "01000000000"
              }
            />
          </div>
        </div>
        <div className="photo-frame relative hidden aspect-[4/5] overflow-hidden rounded-2xl bg-accent-soft md:block">
          <Image
            src="/work.jpg"
            alt={messages.workAlt}
            fill
            className="object-cover"
            sizes="40vw"
          />
        </div>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
