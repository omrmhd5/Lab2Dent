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
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/admin" className="shrink-0 text-sm font-semibold tracking-tight">
            Lab2Dent
          </Link>
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
                  className={`ui-press inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                    active ? "bg-accent-soft text-accent" : "text-muted"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
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
              className="ui-press inline-flex items-center gap-1.5 text-sm text-muted"
            >
              <SignOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
