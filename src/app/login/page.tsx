import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getMessages } from "@/i18n/messages";
import { getLocale } from "@/lib/locale";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const { from } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col px-4 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          {messages.brand}
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle
            toLight={messages.themeToLight}
            toDark={messages.themeToDark}
          />
          <LanguageToggle locale={locale} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {messages.loginTitle}
        </h1>
        <div className="mt-8">
          <LoginForm messages={messages} from={from ?? "/admin"} />
        </div>
      </div>
    </main>
  );
}
