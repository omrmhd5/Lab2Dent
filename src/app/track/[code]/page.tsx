import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { statusLabel } from "@/lib/status";
import { formatEgp } from "@/lib/utils";
import { findPublicOrder } from "@/server/actions/orders";

export default async function TrackCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ code }, query, locale] = await Promise.all([
    params,
    searchParams,
    getLocale(),
  ]);
  const messages = getMessages(locale);
  const order = await findPublicOrder(decodeURIComponent(code));

  if (!order) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <SiteHeader locale={locale} messages={messages} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 md:py-14">
          <h1 className="text-4xl font-semibold tracking-tight">{messages.trackTitle}</h1>
          <p className="mt-4 max-w-[40ch] text-muted">{messages.notFound}</p>
          <Link
            href="/track"
            className="ui-press mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            {messages.lookUp}
          </Link>
        </main>
        <SiteFooter messages={messages} />
      </div>
    );
  }

  const isNew = query.new === "1";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 md:py-14">
        {isNew ? (
          <p className="mb-4 text-sm font-medium text-accent">{messages.doneTitle}</p>
        ) : null}
        <h1 className="font-mono text-4xl tracking-tight md:text-5xl">{order.code}</h1>
        {isNew ? (
          <p className="mt-4 max-w-[45ch] text-lg text-muted">{messages.doneBody}</p>
        ) : null}
        <div className="mt-6">
          <CopyButton value={order.code} idle={messages.copyCode} done={messages.copied} />
        </div>
        <dl className="mt-12 grid max-w-xl gap-8 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">{messages.status}</dt>
            <dd className="mt-1 text-lg font-medium">{statusLabel(order.status, locale)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{messages.category}</dt>
            <dd className="mt-1 text-lg">{order.categoryName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{messages.amountPaid}</dt>
            <dd className="mt-1 font-mono text-lg">{formatEgp(order.priceEgp, locale)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{messages.submittedAt}</dt>
            <dd className="mt-1 text-lg">
              {order.createdAt.toLocaleString(locale === "ar" ? "ar-EG" : "en-GB")}
            </dd>
          </div>
        </dl>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
