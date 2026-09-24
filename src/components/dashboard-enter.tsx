"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.23, 1, 0.32, 1] as const;

export function DashboardEnter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, transform: "translateY(8px)" }
      }
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, transform: "translateY(0px)" }
      }
      transition={{ duration: reduce ? 0.12 : 0.2, ease }}
    >
      {children}
    </motion.div>
  );
}
