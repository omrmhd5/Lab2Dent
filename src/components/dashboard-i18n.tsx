"use client";

import { createContext, useContext } from "react";
import type { Dash } from "@/i18n/dashboard";

const DashboardCopy = createContext<Dash | null>(null);

export function DashboardI18n({
  copy,
  children,
}: {
  copy: Dash;
  children: React.ReactNode;
}) {
  return <DashboardCopy.Provider value={copy}>{children}</DashboardCopy.Provider>;
}

export function useDash() {
  const copy = useContext(DashboardCopy);
  if (!copy) {
    throw new Error("useDash must be used inside the dashboard.");
  }
  return copy;
}
