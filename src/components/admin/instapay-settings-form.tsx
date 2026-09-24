"use client";

import { useActionState, useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { useDash } from "@/components/dashboard-i18n";
import { reportAction } from "@/components/toast";
import { instapayLinkForInput } from "@/lib/instapay";
import { updateInstapaySettings } from "@/server/actions/settings";

export function InstapaySettingsForm({
  instapayLink,
}: {
  instapayLink: string;
}) {
  const t = useDash();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return updateInstapaySettings(formData);
    },
    undefined,
  );

  useEffect(() => {
    reportAction(state, t.instapaySaved);
  }, [state, t.instapaySaved]);

  return (
    <form action={formAction} className="ui-card max-w-xl space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-bold text-muted">{t.instapayLink}</span>
        <input
          className="ui-input font-mono text-sm"
          name="instapayLink"
          defaultValue={instapayLinkForInput(instapayLink)}
          placeholder={t.instapayPlaceholder}
          required
        />
        <span className="block text-xs text-muted">{t.instapayHint}</span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="ui-press ui-btn ui-btn-primary">
        {pending ? <Spinner /> : null}
        {pending ? t.saving : t.saveInstapay}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-danger">{state.error}</p>
      ) : null}
      {state && "ok" in state ? (
        <p className="text-sm font-bold text-accent">{t.savedShort}</p>
      ) : null}
    </form>
  );
}
