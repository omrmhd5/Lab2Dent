"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.23, 1, 0.32, 1] as const;

export function Rise({
  children,
  className,
  delay = 0,
  spring = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  spring?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce ? false : { opacity: 0, transform: "translateY(14px) scale(0.98)" }
      }
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      transition={
        reduce
          ? { duration: 0 }
          : spring
            ? { type: "spring", bounce: 0.18, duration: 0.55, delay }
            : { duration: 0.32, delay, ease }
      }
    >
      {children}
    </motion.div>
  );
}
