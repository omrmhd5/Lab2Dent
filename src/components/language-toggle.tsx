"use client";

import { useTransition } from "react";
import { Spinner } from "@/components/spinner";
import { toast } from "@/components/toast";
import { setLocale } from "@/server/actions/locale";

export function LanguageToggle({ locale }: { locale: "en" | "ar" }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex rounded-full border border-border bg-surface p-0.5 text-xs font-bold">
      <button
        type="button"
        disabled={pending || locale === "en"}
        onClick={() => {
          toast.success("English");
          start(() => setLocale("en"));
        }}
        className={`ui-press min-h-9 min-w-9 rounded-full px-2.5 ${
          locale === "en" ? "bg-brand-solid text-on-brand" : "text-muted"
        }`}>
        {pending && locale !== "en" ? <Spinner className="size-3" /> : "EN"}
      </button>
      <button
        type="button"
        disabled={pending || locale === "ar"}
        onClick={() => {
          toast.success("العربية");
          start(() => setLocale("ar"));
        }}
        className={`ui-press min-h-9 min-w-9 rounded-full px-2.5 ${
          locale === "ar" ? "bg-brand-solid text-on-brand" : "text-muted"
        }`}>
        {pending && locale !== "ar" ? <Spinner className="size-3" /> : "AR"}
      </button>
    </div>
  );
}
