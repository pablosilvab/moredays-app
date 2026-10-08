import { DayStrip, friendlyDate, stripDays, type DayKind } from "@/components/DayStrip";
import { ShareButton } from "@/components/ShareButton";
import { Badge } from "@/components/ui/badge";
import type { AppLocale, BridgeOption } from "@/lib/types";

export function BridgeCard({
  option,
  locale,
  bestLabel,
  daysOffLabel,
  daysUsedLabel,
  alreadyFreeLabel,
  legendVacation,
  legendHoliday,
  legendWeekend,
  holidaysLabel,
  noHolidaysLabel,
  fullWeekLabel,
  country,
  year,
  vacationDays,
  includeWeekends,
  highlighted,
}: {
  option: BridgeOption;
  locale: AppLocale;
  bestLabel?: string;
  daysOffLabel: string;
  daysUsedLabel: string;
  alreadyFreeLabel?: string;
  legendVacation: string;
  legendHoliday: string;
  legendWeekend: string;
  holidaysLabel: string;
  noHolidaysLabel: string;
  fullWeekLabel: string;
  country: string;
  year: number;
  vacationDays: number;
  includeWeekends: boolean;
  highlighted?: boolean;
}) {
  const legend: Record<DayKind, string> = {
    vacation: legendVacation,
    holiday: legendHoliday,
    weekend: legendWeekend,
  };

  return (
    <article
      id={`bridge-${option.id}`}
      className={`grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 ${
        highlighted ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{option.label}</h3>
        <div className="flex flex-wrap gap-1.5">
          {bestLabel ? <Badge>{bestLabel}</Badge> : null}
          {option.kind === "full-week" ? <Badge variant="secondary">{fullWeekLabel}</Badge> : null}
        </div>
      </div>
      <div className="grid gap-0.5">
        <p className="text-2xl font-semibold tracking-tight">{daysOffLabel}</p>
        <p className="text-sm text-muted-foreground">
          {daysUsedLabel}
          {alreadyFreeLabel ? ` · ${alreadyFreeLabel}` : ""}
        </p>
      </div>
      <DayStrip days={stripDays(option, locale, legend)} legend={legend} />
      <div className="text-sm">
        <p className="text-xs text-muted-foreground">{holidaysLabel}</p>
        {option.holidaysIncluded.length === 0 ? (
          <p>{noHolidaysLabel}</p>
        ) : (
          <ul className="mt-1 grid gap-0.5">
            {option.holidaysIncluded.map((holiday) => (
              <li key={holiday.date}>
                <time dateTime={holiday.date}>{friendlyDate(holiday.date, locale)}</time>
                {" · "}
                {holiday.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ShareButton
        locale={locale}
        country={country}
        year={year}
        vacationDays={vacationDays}
        includeWeekends={includeWeekends}
        optionId={option.id}
        label={option.label}
      />
    </article>
  );
}
