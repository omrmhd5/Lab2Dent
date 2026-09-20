"use client";

import { useTransition } from "react";
import { setLocale } from "@/server/actions/locale";

export function LanguageToggle({ locale }: { locale: "en" | "ar" }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex rounded-full border border-border bg-surface p-0.5 text-xs font-bold">
      <button
        type="button"
        disabled={pending || locale === "en"}
        onClick={() => start(() => setLocale("en"))}
        className={`ui-press min-h-9 min-w-9 rounded-full px-2.5 ${
          locale === "en" ? "bg-brand text-white" : "text-muted"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        disabled={pending || locale === "ar"}
        onClick={() => start(() => setLocale("ar"))}
        className={`ui-press min-h-9 min-w-9 rounded-full px-2.5 ${
          locale === "ar" ? "bg-brand text-white" : "text-muted"
        }`}
      >
        AR
      </button>
    </div>
  );
}
