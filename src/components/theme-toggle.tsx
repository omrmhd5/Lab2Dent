"use client";

import { useTransition } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { setTheme } from "@/server/actions/theme";

export function ThemeToggle({
  toLight,
  toDark,
}: {
  toLight: string;
  toDark: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
        document.documentElement.classList.toggle("dark", next === "dark");
        document.documentElement.style.colorScheme = next;
        start(() => setTheme(next));
      }}
      className="ui-press inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
      <span className="sr-only dark:hidden">{toDark}</span>
      <span className="sr-only hidden dark:inline">{toLight}</span>
    </button>
  );
}
