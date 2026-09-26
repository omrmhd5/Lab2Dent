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

const LIGHT_FULL_LOGO = "/Light%20Full%20Logo.PNG";
const DARK_FULL_LOGO = "/Dark%20Full%20Logo.png";

export function BrandLockup({
  label,
  slogan,
}: {
  label: string;
  slogan?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div
        className="relative h-[14rem] w-[24rem] sm:h-[16rem] sm:w-[27rem]"
        aria-hidden="true">
        <img
          src={LIGHT_FULL_LOGO}
          alt=""
          width={2000}
          height={2000}
          className="absolute inset-0 size-full object-contain object-center dark:hidden scale-[1.42] sm:scale-[1.45]"
        />
        <img
          src={DARK_FULL_LOGO}
          alt=""
          width={512}
          height={512}
          className="absolute inset-0 hidden size-full object-contain object-center dark:block scale-[0.86] sm:scale-[0.88]"
        />
      </div>
      <span className="sr-only">{label}</span>
      {slogan ? (
        <p className="text-lg font-medium text-muted sm:text-xl">{slogan}</p>
      ) : null}
    </div>
  );
}
