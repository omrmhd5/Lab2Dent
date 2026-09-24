"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { toast } from "@/components/toast";

export function CopyButton({ value, idle, done }: { value: string; idle: string; done: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="ui-press ui-btn ui-btn-secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast.success(done);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
      {copied ? done : idle}
    </button>
  );
}
