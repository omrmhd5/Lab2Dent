"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Messages } from "@/i18n/messages";

export function TrackForm({ messages }: { messages: Messages }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) router.push(`/track/${trimmed}`);
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-bold">{messages.codeLabel}</span>
        <input
          className="ui-input font-mono uppercase"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={messages.trackPlaceholder}
          required
        />
      </label>
      <button type="submit" className="ui-press ui-btn ui-btn-primary w-full">
        <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
        {messages.lookUp}
      </button>
    </form>
  );
}
