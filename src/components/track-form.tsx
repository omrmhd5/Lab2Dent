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
      className="mt-10 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (trimmed) router.push(`/track/${trimmed}`);
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium">{messages.codeLabel}</span>
        <input
          className="ui-input font-mono uppercase"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={messages.trackPlaceholder}
          required
        />
      </label>
      <button
        type="submit"
        className="ui-press inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
      >
        <MagnifyingGlass size={16} weight="bold" />
        {messages.lookUp}
      </button>
    </form>
  );
}
