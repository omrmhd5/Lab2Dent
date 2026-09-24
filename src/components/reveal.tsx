"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduce ? false : { opacity: 0, transform: "translateY(12px) scale(0.98)" }
      }
      whileInView={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      viewport={{ once: true, amount: 0.35, margin: "-80px" }}
      transition={{
        duration: reduce ? 0 : 0.32,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
