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
      className={`inline-flex items-center gap-2.5 ${inverse ? "text-on-brand" : "text-foreground"}`}>
      <img
        src="/Logo.svg?v=2"
        alt=""
        width={36}
        height={36}
        className="size-9 rounded-xl"
      />
      <span className="text-[15px] font-bold tracking-tight">{label}</span>
    </Link>
  );
}

export function BrandLockup({
  label,
  slogan,
}: {
  label: string;
  slogan?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <img
        src="/Full%20Logo.svg?v=3"
        alt={label}
        width={280}
        height={280}
        className="h-auto w-56 rounded-[1.35rem] bg-[#f9f8f4] sm:w-64"
      />
      {slogan ? (
        <p className="text-lg font-medium text-muted sm:text-xl">{slogan}</p>
      ) : null}
    </div>
  );
}
