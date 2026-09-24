export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <span
      className={`ui-spinner inline-block shrink-0 rounded-full border-2 border-current border-r-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
