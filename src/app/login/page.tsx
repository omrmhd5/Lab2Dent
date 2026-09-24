import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { getMessages } from "@/i18n/messages";
import { getLiveStaffSession } from "@/lib/auth";
import { getLocale } from "@/lib/locale";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const { from } = await searchParams;

  const session = await getLiveStaffSession();
  if (session) {
    const target = from?.startsWith("/dashboard") ? from : "/dashboard";
    redirect(target);
  }

  return (
    <main className="grid min-h-dvh md:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand-solid md:block">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-on-brand">
          <BrandMark label={messages.brand} href="/" inverse />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-on-brand/80">
              {messages.navStaff}
            </p>
            <p className="mt-4 max-w-[16ch] text-5xl font-bold tracking-tight">
              {messages.loginTitle}
            </p>
          </div>
        </div>
      </section>
      <section className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between md:justify-end">
          <span className="md:hidden">
            <BrandMark label={messages.brand} href="/" />
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle
              toLight={messages.themeToLight}
              toDark={messages.themeToDark}
            />
            <LanguageToggle locale={locale} />
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-4xl font-bold tracking-tight">
            {messages.loginTitle}
          </h1>
          <div className="ui-card mt-8">
            <LoginForm messages={messages} from={from ?? "/dashboard"} />
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/"
              className="ui-press text-sm font-bold text-muted hover:text-foreground">
              {messages.navHome}
            </Link>
          </p>
          <aside className="mt-6 rounded-2xl border border-dashed border-border bg-brand-soft/50 px-4 py-4">
            <p className="text-sm font-bold">{messages.demoTitle}</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-muted">{messages.demoAdmin}</dt>
                <dd className="mt-0.5 break-all font-mono">
                  admin@admin.com
                  <span className="mx-2 text-muted">/</span>
                  admin123
                </dd>
              </div>
              <div>
                <dt className="text-muted">{messages.demoEmployee}</dt>
                <dd className="mt-0.5 break-all font-mono">
                  employee@employee.com
                  <span className="mx-2 text-muted">/</span>
                  employee123
                </dd>
              </div>
              <div>
                <dt className="text-muted">{messages.demoLab}</dt>
                <dd className="mt-0.5 break-all font-mono">
                  lab@lab.com
                  <span className="mx-2 text-muted">/</span>
                  lab123
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
