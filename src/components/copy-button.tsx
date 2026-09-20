"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CopyButton({ value, idle, done }: { value: string; idle: string; done: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="ui-press inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
      {copied ? done : idle}
    </button>
  );
}
