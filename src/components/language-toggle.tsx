"use client";

import { useTransition } from "react";
import { setLocale } from "@/server/actions/locale";

export function LanguageToggle({ locale }: { locale: "en" | "ar" }) {
  const [pending, start] = useTransition();

  return (
    <div className="ms-1 flex rounded-full border border-border bg-surface p-0.5 text-xs font-medium">
      <button
        type="button"
        disabled={pending || locale === "en"}
        onClick={() => start(() => setLocale("en"))}
        className={`ui-press rounded-full px-2.5 py-1 ${
          locale === "en" ? "bg-accent text-white" : "text-muted"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        disabled={pending || locale === "ar"}
        onClick={() => start(() => setLocale("ar"))}
        className={`ui-press rounded-full px-2.5 py-1 ${
          locale === "ar" ? "bg-accent text-white" : "text-muted"
        }`}
      >
        AR
      </button>
    </div>
  );
}
