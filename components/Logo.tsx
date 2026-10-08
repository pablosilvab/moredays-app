import { Link } from "@/i18n/navigation";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-0.5 text-lg font-semibold tracking-tight">
      <span>More</span>
      <span aria-hidden className="text-brand text-base font-bold">
        +
      </span>
      <span>Days</span>
      <span className="sr-only">MoreDays</span>
    </Link>
  );
}
