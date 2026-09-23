import { PencilSimple, Trash } from "@phosphor-icons/react";

const baseClass =
  "ui-press ui-btn ui-btn-sm grid size-9 shrink-0 place-items-center";

export function EditIconButton({
  label = "Edit",
  type = "button",
  disabled = false,
  className = "",
  onClick,
}: {
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClass} ui-btn-secondary ${className}`}>
      <PencilSimple size={18} weight="bold" aria-hidden="true" />
    </button>
  );
}

export function ConfirmDeleteButton({
  label = "Delete",
  type = "button",
  disabled = false,
  pending = false,
  className = "",
  onClick,
}: {
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  pending?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      onClick={onClick}
      className={`ui-press ui-btn ui-btn-sm bg-danger text-white ${className}`}>
      {pending ? `${label}…` : label}
    </button>
  );
}

export function DeleteIconButton({
  label = "Delete",
  type = "button",
  disabled = false,
  pending = false,
  variant = "soft",
  className = "",
  onClick,
}: {
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  pending?: boolean;
  variant?: "soft" | "solid";
  className?: string;
  onClick?: () => void;
}) {
  const variantClass =
    variant === "solid" ? "bg-danger text-white" : "bg-danger/10 text-danger";

  return (
    <button
      type={type}
      aria-label={pending ? `${label}…` : label}
      title={pending ? `${label}…` : label}
      disabled={disabled || pending}
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`}>
      <Trash size={18} weight="bold" aria-hidden="true" />
    </button>
  );
}
