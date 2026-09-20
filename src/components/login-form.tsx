"use client";

import { useActionState } from "react";
import { loginStaff, type LoginState } from "@/server/actions/auth";
import type { Messages } from "@/i18n/messages";

const initial: LoginState = {};

export function LoginForm({
  messages,
  from,
}: {
  messages: Messages;
  from: string;
}) {
  const [state, action, pending] = useActionState(loginStaff, initial);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="from" value={from} />
      <label className="block space-y-2">
        <span className="text-sm font-bold">{messages.email}</span>
        <input className="ui-input" name="email" type="email" autoComplete="username" required />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-bold">{messages.password}</span>
        <input
          className="ui-input"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error ? (
        <p className="text-sm font-bold text-danger" role="alert">
          {messages.loginError}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="ui-press ui-btn ui-btn-primary w-full">
        {messages.signIn}
      </button>
    </form>
  );
}
