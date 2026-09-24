"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Spinner } from "@/components/spinner";
import type { Messages } from "@/i18n/messages";

export function TrackForm({ messages }: { messages: Messages }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        start(() => router.push(`/track/${trimmed}`));
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
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="ui-press ui-btn ui-btn-primary w-full">
        {pending ? (
          <Spinner />
        ) : (
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
        )}
        {messages.lookUp}
      </button>
    </form>
  );
}
