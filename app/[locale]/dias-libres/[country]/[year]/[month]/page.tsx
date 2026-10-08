import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BridgeSection } from "@/components/BridgeSection";
import { HolidayList } from "@/components/HolidayList";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { countryName, supportedCountries } from "@/lib/countries";
import { monthsWithContent, optionsInMonth, presetResult } from "@/lib/content";
import { parseISODate } from "@/lib/dates";
import { getHolidayFile, getSupportedYears } from "@/lib/holidays";
import { monthIndexFromSlug, monthName, monthSlug } from "@/lib/months";
import { pageMetadata } from "@/lib/seo";
import { PRESET_VACATION_DAYS } from "@/lib/site";
import type { AppLocale, HolidayFile } from "@/lib/types";

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as AppLocale;
  return supportedCountries().flatMap((country) =>
    getSupportedYears(country.code).flatMap((year) =>
      monthsWithContent(country.code, year, locale).map((month) => ({
        country: country.code.toLowerCase(),
        year: String(year),
        month: monthSlug(month, locale),
      })),
    ),
  );
}

function monthFile(file: HolidayFile, year: number, monthIndex: number): HolidayFile {
  return {
    ...file,
    holidays: file.holidays.filter((holiday) => {
      if (!holiday.date) return false;
      const date = parseISODate(holiday.date);
      return date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex;
    }),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string; month: string }>;
}) {
  const { locale, country, year, month } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const current = locale as AppLocale;
  const monthIndex = monthIndexFromSlug(month, current);
  if (monthIndex === null || !getHolidayFile(country, Number(year))) return {};
  const t = await getTranslations({ locale: current, namespace: "seo" });
  const name = countryName(country, current);
  const label = monthName(monthIndex, current);
  const best = optionsInMonth(presetResult(current, country, Number(year)).options, Number(year), monthIndex)[0];
  const description = best
    ? t("monthDescription", {
        month: label,
        year,
        country: name,
        days: PRESET_VACATION_DAYS,
        label: best.label,
        total: best.totalDays,
      })
    : t("monthDescriptionEmpty", { month: label, year, country: name });
  const path = `/dias-libres/${country.toLowerCase()}/${year}/${monthSlug(monthIndex, current)}`;

  return pageMetadata({
    locale: current,
    title: t("monthTitle", { month: label, year, country: name }),
    description,
    path,
    pathForLocale: (target) =>
      `/dias-libres/${country.toLowerCase()}/${year}/${monthSlug(monthIndex, target)}`,
  });
}

function PageFallback() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function BridgesMonthPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string; month: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BridgesMonthContent params={params} />
    </Suspense>
  );
}

async function BridgesMonthContent({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string; month: string }>;
}) {
  const { locale, country, year, month } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const current = locale as AppLocale;
  const monthIndex = monthIndexFromSlug(month, current);
  const yearNumber = Number(year);
  const holidayFile = getHolidayFile(country, yearNumber);
  if (monthIndex === null || !holidayFile) notFound();
  setRequestLocale(locale);

  const name = countryName(country, current);
  const label = monthName(monthIndex, current);
  const t = await getTranslations({ locale: current, namespace: "bridges" });

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight capitalize">
          {t("monthTitle", { month: label, year })}
        </h1>
        <Link
          href={`/dias-libres/${country.toLowerCase()}/${year}`}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          {t("seeYear")}
        </Link>
      </div>
      <BridgeSection
        locale={current}
        country={country}
        year={yearNumber}
        monthIndex={monthIndex}
        heading={t("titleIn", { year, country: name })}
      />
      <HolidayList
        locale={current}
        holidayFile={monthFile(holidayFile, yearNumber, monthIndex)}
        countryName={name}
      />
    </div>
  );
}
