"use client";

import { useActionState } from "react";
import { instapayLinkForInput } from "@/lib/instapay";
import { updateInstapaySettings } from "@/server/actions/settings";

export function InstapaySettingsForm({
  instapayLink,
}: {
  instapayLink: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return updateInstapaySettings(formData);
    },
    undefined,
  );

  return (
    <form action={formAction} className="ui-card max-w-xl space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-bold text-muted">Instapay link</span>
        <input
          className="ui-input font-mono text-sm"
          name="instapayLink"
          defaultValue={instapayLinkForInput(instapayLink)}
          placeholder="https://instapay.example or 01001234567"
          required
        />
        <span className="block text-xs text-muted">
          Full URL, or a phone number. Students tap this on the pay step.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        Save Instapay
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
      {state && "ok" in state ? (
        <p className="text-sm font-bold text-accent">Saved.</p>
      ) : null}
    </form>
  );
}
