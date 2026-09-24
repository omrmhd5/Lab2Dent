import { Spinner } from "@/components/spinner";

export function RouteLoading() {
  return (
    <div
      className="grid min-h-[50vh] place-items-center"
      role="status"
      aria-live="polite">
      <Spinner className="size-8 border-[3px] text-accent" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
