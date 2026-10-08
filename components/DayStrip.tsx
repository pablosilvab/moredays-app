import { addDays, diffDays, formatISODate, isWeekend, parseISODate } from "@/lib/dates";
import type { AppLocale, BridgeOption } from "@/lib/types";

const intlLocale: Record<AppLocale, string> = {
  es: "es-CL",
  en: "en",
  pt: "pt-BR",
};

export type DayKind = "vacation" | "holiday" | "weekend";

export type StripDay = {
  iso: string;
  kind: DayKind;
  name?: string;
  weekday: string;
  day: string;
  month: string;
  aria: string;
};

const styles: Record<DayKind, string> = {
  vacation: "bg-primary text-primary-foreground",
  holiday: "bg-brand text-brand-foreground",
  weekend: "bg-muted text-muted-foreground ring-1 ring-inset ring-foreground/20",
};

function cleanToken(value: string): string {
  return value.replace(/\./g, "").trim();
}

function dayParts(iso: string, locale: AppLocale) {
  const intl = intlLocale[locale];
  const date = parseISODate(iso);
  const longDate = new Intl.DateTimeFormat(intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
  return {
    date,
    weekday: cleanToken(
      new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }).format(date),
    ),
    day: new Intl.DateTimeFormat(intl, { day: "numeric", timeZone: "UTC" }).format(date),
    month: cleanToken(new Intl.DateTimeFormat(intl, { month: "short", timeZone: "UTC" }).format(date)),
    longDate,
  };
}

export function stripDays(
  option: BridgeOption,
  locale: AppLocale,
  kindLabel: Record<DayKind, string>,
): StripDay[] {
  const start = parseISODate(option.startDate);
  const count = diffDays(start, parseISODate(option.endDate)) + 1;
  const holidays = new Map(option.holidaysIncluded.map((holiday) => [holiday.date, holiday.name]));

  return Array.from({ length: count }, (_, index) => {
    const iso = formatISODate(addDays(start, index));
    const name = holidays.get(iso);
    const parts = dayParts(iso, locale);
    const kind: DayKind = name ? "holiday" : isWeekend(parts.date) ? "weekend" : "vacation";
    return {
      iso,
      kind,
      name,
      weekday: parts.weekday,
      day: parts.day,
      month: parts.month,
      aria: name ? `${parts.longDate}, ${kindLabel[kind]}, ${name}` : `${parts.longDate}, ${kindLabel[kind]}`,
    };
  });
}

export function friendlyDate(iso: string, locale: AppLocale): string {
  const parts = dayParts(iso, locale);
  return `${parts.weekday} ${parts.day} ${parts.month}`;
}

export function DayStrip({
  days,
  legend,
}: {
  days: StripDay[];
  legend: Record<DayKind, string>;
}) {
  const order: DayKind[] = ["vacation", "holiday", "weekend"];

  return (
    <div className="grid gap-2">
      <ol className="flex flex-wrap gap-1">
        {days.map((day) => (
          <li
            key={day.iso}
            aria-label={day.aria}
            className={`flex w-11 flex-col items-center rounded-md px-0.5 py-1 text-center ${styles[day.kind]}`}
          >
            <span className="text-[10px] uppercase leading-none tracking-wide" aria-hidden="true">
              {day.weekday}
            </span>
            <span className="text-sm font-semibold leading-tight" aria-hidden="true">
              {day.day}
            </span>
            <span className="text-[10px] leading-none" aria-hidden="true">
              {day.month}
            </span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {order.map((kind) => (
          <li key={kind} className="flex items-center gap-1.5">
            <span className={`size-2.5 shrink-0 rounded-sm ${styles[kind]}`} aria-hidden="true" />
            {legend[kind]}
          </li>
        ))}
      </ul>
    </div>
  );
}
