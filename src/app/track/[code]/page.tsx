import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";
import { OrderStatusPill } from "@/components/admin/status-pill";
import { formatDateTime, formatEgp } from "@/lib/utils";
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
      <div className="flex min-h-dvh flex-col">
        <SiteHeader locale={locale} messages={messages} />
        <main
          id="main"
          className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-6 md:py-16">
          <div className="ui-card mx-auto max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight">
              {messages.trackTitle}
            </h1>
            <p className="mt-4 max-w-[40ch] text-muted">{messages.notFound}</p>
            <Link href="/track" className="ui-press ui-btn ui-btn-primary mt-8">
              {messages.lookUp}
            </Link>
          </div>
        </main>
        <SiteFooter messages={messages} />
      </div>
    );
  }

  const isNew = query.new === "1";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main
        id="main"
        className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-12 sm:px-6 md:py-16">
        <div className="ui-card mx-auto max-w-2xl">
          {isNew ? (
            <p className="mb-4 text-sm font-bold text-accent">
              {messages.doneTitle}
            </p>
          ) : null}
          <p className="font-mono text-sm font-bold text-muted">
            #{order.orderNumber}
          </p>
          <h1 className="font-mono text-4xl font-bold tracking-tight md:text-5xl">
            {order.code}
          </h1>
          {isNew ? (
            <p className="mt-4 max-w-[45ch] text-lg text-muted">
              {messages.doneBody}
            </p>
          ) : null}
          <div className="mt-6">
            <CopyButton
              value={order.code}
              idle={messages.copyCode}
              done={messages.copied}
            />
          </div>
          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-soft p-4">
              <dt className="text-sm font-bold text-muted">
                {messages.status}
              </dt>
              <dd className="mt-2">
                <OrderStatusPill
                  status={order.status}
                  locale={locale}
                  className="text-sm"
                />
              </dd>
            </div>
            <div className="rounded-2xl bg-brand-soft p-4">
              <dt className="text-sm font-bold text-muted">
                {messages.category}
              </dt>
              <dd className="mt-1 text-lg font-bold">{order.categoryName}</dd>
            </div>
            <div className="rounded-2xl bg-brand-soft p-4">
              <dt className="text-sm font-bold text-muted">
                {messages.amountPaid}
              </dt>
              <dd className="mt-1 font-mono text-lg font-bold">
                {formatEgp(order.priceEgp, locale)}
              </dd>
            </div>
            <div className="rounded-2xl bg-brand-soft p-4">
              <dt className="text-sm font-bold text-muted">
                {messages.submittedAt}
              </dt>
              <dd className="mt-1 text-lg font-bold">
                {formatDateTime(order.createdAt, locale)}
              </dd>
            </div>
          </dl>
        </div>
      </main>
      <SiteFooter messages={messages} />
    </div>
  );
}
