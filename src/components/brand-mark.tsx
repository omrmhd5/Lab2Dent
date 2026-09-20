import Link from "next/link";

export function BrandMark({
  label,
  href = "/",
  inverse = false,
}: {
  label: string;
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${inverse ? "text-white" : ""}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-9 place-items-center rounded-xl shadow-[var(--shadow-sm)] ${
          inverse ? "bg-white text-brand" : "bg-brand text-white"
        }`}
      >
        <ToothIcon />
      </span>
      <span className="text-[15px] font-bold tracking-tight">{label}</span>
    </Link>
  );
}

function ToothIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
      <path d="M168 24H88A56 56 0 0 0 32 79.75c0 42.72 8 75.4 14.7 95.28 8.72 25.8 20.62 45.49 32.64 54A15.67 15.67 0 0 0 88.47 232a16.09 16.09 0 0 0 16-14.9c.85-11.52 5-49.11 23.53-49.11s22.68 37.59 23.53 49.11a16.09 16.09 0 0 0 9.18 13.36 15.69 15.69 0 0 0 15.95-1.41c12-8.53 23.92-28.22 32.64-54C216 155.15 224 122.47 224 79.75A56 56 0 0 0 168 24Z" />
    </svg>
  );
}
