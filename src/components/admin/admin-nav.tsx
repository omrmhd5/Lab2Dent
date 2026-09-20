"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardText,
  Stack,
  Users,
  IdentificationCard,
  SignOut,
} from "@phosphor-icons/react";
import { logoutStaff } from "@/server/actions/auth";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/admin", label: "Orders", icon: ClipboardText, exact: true },
    { href: "/admin/categories", label: "Categories", icon: Stack },
    { href: "/admin/customers", label: "Customers", icon: Users },
    ...(isAdmin
      ? [{ href: "/admin/employees", label: "Employees", icon: IdentificationCard }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-5">
          <div className="flex shrink-0 items-center gap-2">
            <BrandMark label="Lab2Dent" href="/admin" />
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand">
              Desk
            </span>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`ui-press inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-bold ${
                    active ? "bg-accent-soft text-accent" : "text-muted"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle toLight="Switch to light mode" toDark="Switch to dark mode" />
          <form action={logoutStaff}>
            <button
              type="submit"
              className="ui-press inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-bold text-muted"
            >
              <SignOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
