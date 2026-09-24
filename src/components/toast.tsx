"use client";

import { useEffect, useState } from "react";

type ToastItem = {
  id: number;
  tone: "success" | "error";
  message: string;
  leaving?: boolean;
};

type ActionResult = {
  error?: string;
  ok?: boolean;
};

let nextId = 1;
let items: ToastItem[] = [];
const listeners = new Set<(next: ToastItem[]) => void>();

function publish(next: ToastItem[]) {
  items = next;
  listeners.forEach((listener) => listener(items));
}

function dismiss(id: number) {
  const current = items.find((item) => item.id === id);
  if (!current || current.leaving) return;
  publish(
    items.map((item) => (item.id === id ? { ...item, leaving: true } : item)),
  );
  window.setTimeout(() => {
    publish(items.filter((item) => item.id !== id));
  }, 240);
}

function push(tone: ToastItem["tone"], message: string) {
  const id = nextId++;
  const next = [...items, { id, tone, message }];
  const active = next.filter((item) => !item.leaving);
  const overflow = active
    .slice(0, Math.max(0, active.length - 3))
    .map((item) => item.id);
  publish(
    next.map((item) =>
      overflow.includes(item.id) ? { ...item, leaving: true } : item,
    ),
  );
  for (const extra of overflow) {
    window.setTimeout(() => {
      publish(items.filter((item) => item.id !== extra));
    }, 240);
  }
  window.setTimeout(() => dismiss(id), 4200);
}

export const toast = {
  success(message: string) {
    push("success", message);
  },
  error(message: string) {
    push("error", message);
  },
};

export function reportAction(
  result: ActionResult | null | undefined,
  success: string,
) {
  if (!result) return;
  if (result.error) {
    toast.error(result.error);
    return;
  }
  if (result.ok) toast.success(success);
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>(items);

  useEffect(() => {
    setToasts(items);
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-[5.5rem] end-2 z-[80] flex w-[min(24rem,calc(100vw-1rem))] flex-col items-stretch gap-2 sm:end-3">
      {toasts.map((item) => (
        <div
          key={item.id}
          role={item.tone === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold shadow-[var(--shadow-lg)] ${
            item.leaving ? "toast-out" : "toast-in"
          } ${
            item.tone === "error"
              ? "border-danger/30 bg-surface text-danger"
              : "border-border bg-surface text-foreground"
          }`}>
          <span
            className={`mt-1 size-2 shrink-0 rounded-full ${
              item.tone === "error" ? "bg-danger" : "bg-accent"
            }`}
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1">{item.message}</p>
          <button
            type="button"
            className="ui-press text-muted"
            aria-label="Dismiss"
            onClick={() => dismiss(item.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const shownMountToasts = new Set<string>();

export function ToastOnMount({
  message,
  tone = "success",
  onceKey,
}: {
  message: string;
  tone?: "success" | "error";
  onceKey?: string;
}) {
  useEffect(() => {
    const key = onceKey ?? `${tone}:${message}`;
    if (shownMountToasts.has(key)) return;
    shownMountToasts.add(key);
    toast[tone](message);
  }, [message, tone, onceKey]);

  return null;
}
