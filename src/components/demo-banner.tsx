export function DemoBanner({ demo, wake }: { demo: string; wake: string }) {
  return (
    <div className="bg-accent px-4 py-2 text-center text-xs font-bold tracking-[0.16em] text-on-accent sm:text-sm">
      {demo} · {wake}
    </div>
  );
}
