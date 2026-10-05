export function DemoBanner({ label }: { label: string }) {
  return (
    <div className="bg-accent px-4 py-2 text-center text-xs font-bold tracking-[0.16em] text-on-accent">
      {label}
    </div>
  );
}
