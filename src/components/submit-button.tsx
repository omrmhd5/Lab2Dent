"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/spinner";

export function SubmitButton({
  children,
  className,
  disabled = false,
  pending = false,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const busy = pending || status.pending;

  return (
    <button
      type="submit"
      disabled={disabled || busy}
      aria-busy={busy}
      className={className}>
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}
