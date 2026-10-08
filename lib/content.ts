import { parseISODate } from "@/lib/dates";
import { getHolidayFile } from "@/lib/holidays";
import { overlapsMonth, optimize } from "@/lib/optimize";
import { PRESET_INCLUDE_WEEKENDS, PRESET_VACATION_DAYS } from "@/lib/site";
import type { AppLocale, BridgeOption, OptimizationResult } from "@/lib/types";

export function presetResult(locale: AppLocale, country: string, year: number): OptimizationResult {
  return optimize({
    locale,
    country,
    year,
    vacationDays: PRESET_VACATION_DAYS,
    includeWeekends: PRESET_INCLUDE_WEEKENDS,
  });
}

export function monthsWithContent(country: string, year: number, locale: AppLocale): number[] {
  const file = getHolidayFile(country, year);
  const result = presetResult(locale, country, year);
  const months = new Set<number>();

  for (const holiday of file?.holidays ?? []) {
    if (!holiday.date?.startsWith(String(year))) continue;
    months.add(parseISODate(holiday.date).getUTCMonth());
  }

  for (const option of [...result.options, ...result.freeOptions]) {
    for (let month = 0; month < 12; month += 1) {
      if (overlapsMonth(option, year, month)) months.add(month);
    }
  }

  return [...months].sort((a, b) => a - b);
}

export function optionsInMonth(options: BridgeOption[], year: number, monthIndex: number): BridgeOption[] {
  return options.filter((option) => overlapsMonth(option, year, monthIndex));
}
