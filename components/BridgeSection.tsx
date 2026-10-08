import { getTranslations } from "next-intl/server";
import { BridgeCard } from "@/components/BridgeCard";
import { optionsInMonth, presetResult } from "@/lib/content";
import {
  PRESET_INCLUDE_WEEKENDS,
  PRESET_VACATION_DAYS,
  VISIBLE_FREE_OPTIONS,
  VISIBLE_OPTIONS,
} from "@/lib/site";
import type { AppLocale, BridgeOption } from "@/lib/types";

function optionLabels(
  t: (key: string, values?: { count: number }) => string,
  option: BridgeOption,
) {
  const extra = option.totalDays - option.vacationDaysUsed;
  return {
    daysOffLabel: t("daysOff", { count: option.totalDays }),
    daysUsedLabel:
      option.vacationDaysUsed === 0
        ? t("noVacation")
        : t("daysUsed", { count: option.vacationDaysUsed }),
    alreadyFreeLabel:
      option.vacationDaysUsed > 0 && extra > 0 ? t("alreadyFree", { count: extra }) : undefined,
  };
}

export async function BridgeSection({
  locale,
  country,
  year,
  monthIndex,
  heading,
}: {
  locale: AppLocale;
  country: string;
  year: number;
  monthIndex?: number;
  heading: string;
}) {
  const t = await getTranslations({ locale, namespace: "calculator" });
  const bridges = await getTranslations({ locale, namespace: "bridges" });
  const result = presetResult(locale, country, year);
  const options = (
    monthIndex === undefined ? result.options : optionsInMonth(result.options, year, monthIndex)
  ).slice(0, monthIndex === undefined ? VISIBLE_OPTIONS : undefined);
  const freeOptions = (
    monthIndex === undefined
      ? result.freeOptions
      : optionsInMonth(result.freeOptions, year, monthIndex)
  ).slice(0, monthIndex === undefined ? VISIBLE_FREE_OPTIONS : undefined);

  return (
    <section className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
        <p className="text-sm text-muted-foreground">{t("presetNote")}</p>
      </div>
      {options.length === 0 ? <p className="text-sm text-muted-foreground">{bridges("none")}</p> : null}
      <div className="grid gap-3">
        {options.map((option) => (
          <BridgeCard
            key={option.id}
            option={option}
            locale={locale}
            highlighted={option.id === result.bestOption?.id && monthIndex === undefined}
            bestLabel={
              option.id === result.bestOption?.id && monthIndex === undefined ? t("best") : undefined
            }
            {...optionLabels(t, option)}
            legendVacation={t("legendVacation")}
            legendHoliday={t("legendHoliday")}
            legendWeekend={t("legendWeekend")}
            holidaysLabel={t("holidaysIn")}
            noHolidaysLabel={t("noHolidays")}
            fullWeekLabel={t("fullWeek")}
            country={country}
            year={year}
            vacationDays={PRESET_VACATION_DAYS}
            includeWeekends={PRESET_INCLUDE_WEEKENDS}
          />
        ))}
      </div>
      {freeOptions.length > 0 ? (
        <div className="grid gap-2">
          <h3 className="text-base font-medium">{t("freeTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("freeHint")}</p>
          {freeOptions.map((option) => (
            <BridgeCard
              key={option.id}
              option={option}
              locale={locale}
              {...optionLabels(t, option)}
              legendVacation={t("legendVacation")}
              legendHoliday={t("legendHoliday")}
              legendWeekend={t("legendWeekend")}
              holidaysLabel={t("holidaysIn")}
              noHolidaysLabel={t("noHolidays")}
              fullWeekLabel={t("fullWeek")}
              country={country}
              year={year}
              vacationDays={PRESET_VACATION_DAYS}
              includeWeekends={PRESET_INCLUDE_WEEKENDS}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
