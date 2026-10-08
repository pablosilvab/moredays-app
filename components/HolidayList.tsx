import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { isWeekendISO } from "@/lib/dates";
import type { AppLocale, Holiday, HolidayFile } from "@/lib/types";

export async function HolidayList({
  locale,
  holidayFile,
  countryName,
}: {
  locale: AppLocale;
  holidayFile: HolidayFile | null;
  countryName?: string;
}) {
  const t = await getTranslations({ locale, namespace: "holidayList" });
  const types = await getTranslations({ locale, namespace: "holidayTypes" });
  const holidays = holidayFile?.holidays ?? [];

  if (!holidayFile || holidays.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {countryName
            ? t("titleIn", { year: holidayFile.year, country: countryName })
            : t("title", { year: holidayFile.year })}
        </h2>
        <p className="text-sm text-muted-foreground">
          <a className="underline underline-offset-4" href={holidayFile.source} rel="noreferrer">
            {t("source")}
          </a>
          {" · "}
          {t("updated", { date: holidayFile.last_updated })}
        </p>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {holidays.map((holiday) => (
          <HolidayRow key={`${holiday.date}-${holiday.name.es}`} holiday={holiday} locale={locale} types={types} weekendLabel={t("weekend")} pendingLabel={t("pending")} />
        ))}
      </ul>
    </section>
  );
}

function HolidayRow({
  holiday,
  locale,
  types,
  weekendLabel,
  pendingLabel,
}: {
  holiday: Holiday;
  locale: AppLocale;
  types: Awaited<ReturnType<typeof getTranslations>>;
  weekendLabel: string;
  pendingLabel: string;
}) {
  const weekend = holiday.date ? isWeekendISO(holiday.date) : false;
  const dateLabel = holiday.date
    ? new Intl.DateTimeFormat(locale === "es" ? "es-CL" : locale === "pt" ? "pt-BR" : "en", {
        day: "numeric",
        month: "short",
        weekday: "short",
        timeZone: "UTC",
      }).format(new Date(`${holiday.date}T00:00:00Z`))
    : pendingLabel;

  return (
    <li className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
      <time dateTime={holiday.date ?? undefined} className="text-sm font-medium capitalize">
        {dateLabel}
      </time>
      <div>
        <p>{holiday.name[locale]}</p>
        {weekend ? <p className="text-xs text-muted-foreground">{weekendLabel}</p> : null}
        {!holiday.date ? <p className="text-xs text-muted-foreground">{pendingLabel}</p> : null}
      </div>
      <Badge variant="secondary">{types(holiday.type)}</Badge>
    </li>
  );
}
