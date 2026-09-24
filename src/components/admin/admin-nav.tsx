"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardText,
  Gear,
  IdentificationCard,
  List,
  SignOut,
  GraduationCap,
  House,
  Stack,
  X,
} from "@phosphor-icons/react";
import type { StaffRole } from "@/db/schema";
import { logoutStaff } from "@/server/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { SubmitButton } from "@/components/submit-button";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDash } from "@/components/dashboard-i18n";
import { getMessages } from "@/i18n/messages";

type NavLink = {
  href: string;
  label: string;
  icon: typeof ClipboardText;
  exact?: boolean;
};

export function AdminNav({
  role,
  name,
  email,
}: {
  role: StaffRole;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useDash();
  const messages = getMessages(t.locale);

  const links: NavLink[] =
    role === "admin"
      ? [
          {
            href: "/dashboard",
            label: t.orders,
            icon: ClipboardText,
            exact: true,
          },
          { href: "/dashboard/categories", label: t.categories, icon: Stack },
          {
            href: "/dashboard/universities",
            label: t.universities,
            icon: GraduationCap,
          },
          {
            href: "/dashboard/employees",
            label: t.staff,
            icon: IdentificationCard,
          },
          { href: "/dashboard/settings", label: t.settings, icon: Gear },
        ]
      : [
          {
            href: "/dashboard",
            label: t.orders,
            icon: ClipboardText,
            exact: true,
          },
        ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function isActive(link: NavLink) {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-1 p-3">
        {links.map((link) => {
          const active = isActive(link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`ui-press flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${
                active ? "bg-accent-soft text-accent" : "text-muted"
              }`}>
              <Icon
                size={18}
                weight={active ? "fill" : "regular"}
                aria-hidden="true"
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  function SidebarFooter() {
    return (
      <div className="mt-auto space-y-2 border-t border-border p-3">
        <div className="px-1 pb-1">
          <p className="truncate text-sm font-bold">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <Link
          href="/"
          className="ui-press flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted">
          <House size={18} aria-hidden="true" />
          {t.home}
        </Link>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted">{t.theme}</span>
          <ThemeToggle
            toLight={messages.themeToLight}
            toDark={messages.themeToDark}
          />
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted">{t.language}</span>
          <LanguageToggle locale={t.locale} />
        </div>
        <form action={logoutStaff}>
          <SubmitButton className="ui-press flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-muted">
            <SignOut size={18} aria-hidden="true" />
            {t.signOut}
          </SubmitButton>
        </form>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <BrandMark label="Lab2Dent" href="/dashboard" />
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
            {t.desk}
          </span>
        </div>
        <button
          type="button"
          className="ui-press grid size-11 place-items-center rounded-xl text-foreground"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          aria-label={open ? t.closeMenu : t.openMenu}
          onClick={() => setOpen((current) => !current)}>
          {open ? (
            <X size={22} weight="bold" />
          ) : (
            <List size={22} weight="bold" />
          )}
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label={t.closeMenu}
          className="nav-scrim fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id="admin-sidebar"
        className={`nav-sheet fixed inset-y-0 start-0 z-50 flex h-dvh w-60 flex-col border-e border-border bg-surface shadow-[var(--shadow-lg)] md:relative md:z-auto md:h-dvh md:w-56 md:shrink-0 md:translate-x-0 md:shadow-none ${
          open
            ? "translate-x-0"
            : "max-md:-translate-x-full max-md:rtl:translate-x-full"
        }`}>
        <div className="hidden border-b border-border p-4 md:block">
          <div className="flex items-center gap-2">
            <BrandMark label="Lab2Dent" href="/dashboard" />
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
              {t.desk}
            </span>
          </div>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </aside>
    </>
  );
}
