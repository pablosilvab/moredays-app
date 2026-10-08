"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BridgeCard } from "@/components/BridgeCard";
import { CountrySelector } from "@/components/CountrySelector";
import { YearCarousel } from "@/components/YearCarousel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getSupportedYears } from "@/lib/holidays";
import { optimize } from "@/lib/optimize";
import { MAX_VACATION_DAYS, MIN_VACATION_DAYS, VISIBLE_FREE_OPTIONS, VISIBLE_OPTIONS } from "@/lib/site";
import type { AppLocale, BridgeOption, OptimizationResult } from "@/lib/types";
import { clamp } from "@/lib/utils";

export type CalculatorInitial = {
  country: string;
  year: number;
  days: number;
  weekends: boolean;
  optionId?: string;
  autorun?: boolean;
};

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

export function BridgeCalculator({
  locale,
  initial,
}: {
  locale: AppLocale;
  initial: CalculatorInitial;
}) {
  const t = useTranslations("calculator");
  const [country, setCountry] = useState(initial.country);
  const [year, setYear] = useState(initial.year);
  const [days, setDays] = useState(initial.days);
  const [weekends, setWeekends] = useState(initial.weekends);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const years = useMemo(() => getSupportedYears(country), [country]);

  useEffect(() => {
    if (!years.includes(year) && years[0]) setYear(years[0]);
  }, [year, years]);

  useEffect(() => {
    if (!initial.autorun) return;
    const next = optimize({
      country: initial.country,
      year: initial.year,
      vacationDays: initial.days,
      includeWeekends: initial.weekends,
      locale,
    });
    setResult(next);
  }, [initial, locale]);

  useEffect(() => {
    if (!result || !initial.optionId) return;
    document.getElementById(`bridge-${initial.optionId}`)?.scrollIntoView({ block: "center" });
  }, [result, initial.optionId]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setResult(
      optimize({
        country,
        year,
        vacationDays: days,
        includeWeekends: weekends,
        locale,
      }),
    );
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="grid gap-4">
          <YearCarousel years={years} value={year} onChange={setYear} />
          <CountrySelector locale={locale} value={country} onChange={setCountry} />
        </div>
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="vacation-days">{t("daysLabel")}</Label>
            <Input
              id="vacation-days"
              className="h-8 w-16 text-center"
              type="number"
              inputMode="numeric"
              min={MIN_VACATION_DAYS}
              max={MAX_VACATION_DAYS}
              value={days}
              onChange={(event) =>
                setDays(clamp(Number(event.target.value || 0), MIN_VACATION_DAYS, MAX_VACATION_DAYS))
              }
            />
          </div>
          <Slider
            min={MIN_VACATION_DAYS}
            max={MAX_VACATION_DAYS}
            value={[days]}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setDays(next);
            }}
            aria-label={t("daysLabel")}
          />
          <p className="text-xs text-muted-foreground">{t("daysValue", { count: days })}</p>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="weekends"
            checked={weekends}
            aria-label={t("weekends")}
            onCheckedChange={(checked) => setWeekends(checked)}
          />
          <div className="grid gap-0.5">
            <Label htmlFor="weekends">{t("weekends")}</Label>
            <p className="text-xs text-muted-foreground">{t("weekendsHint")}</p>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full">
          {t("submit")}
        </Button>
      </form>

      <div aria-live="polite" className="grid gap-3">
        {result ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-3 duration-500">
            <h2 className="text-lg font-semibold">{t("results")}</h2>
            {result.options.length === 0 && result.freeOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : null}
            {result.options.slice(0, VISIBLE_OPTIONS).map((option) => (
              <BridgeCard
                key={option.id}
                option={option}
                locale={locale}
                highlighted={option.id === result.bestOption?.id}
                bestLabel={option.id === result.bestOption?.id ? t("best") : undefined}
                {...optionLabels(t, option)}
                legendVacation={t("legendVacation")}
                legendHoliday={t("legendHoliday")}
                legendWeekend={t("legendWeekend")}
                holidaysLabel={t("holidaysIn")}
                noHolidaysLabel={t("noHolidays")}
                fullWeekLabel={t("fullWeek")}
                country={country}
                year={year}
                vacationDays={days}
                includeWeekends={weekends}
              />
            ))}
            {result.freeOptions.slice(0, VISIBLE_FREE_OPTIONS).length > 0 ? (
              <div className="grid gap-2">
                <h3 className="text-base font-medium">{t("freeTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("freeHint")}</p>
                {result.freeOptions.slice(0, VISIBLE_FREE_OPTIONS).map((option) => (
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
                    vacationDays={days}
                    includeWeekends={weekends}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
