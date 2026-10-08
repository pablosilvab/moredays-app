import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdSlot } from "@/components/AdSlot";
import { BridgeSection } from "@/components/BridgeSection";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { countryName, supportedCountries } from "@/lib/countries";
import { monthsWithContent, presetResult } from "@/lib/content";
import { getHolidayFile, getSupportedYears } from "@/lib/holidays";
import { monthName, monthSlug } from "@/lib/months";
import { pageMetadata } from "@/lib/seo";
import { PRESET_VACATION_DAYS } from "@/lib/site";
import type { AppLocale } from "@/lib/types";

export function generateStaticParams() {
  return supportedCountries().flatMap((country) =>
    getSupportedYears(country.code).map((year) => ({
      country: country.code.toLowerCase(),
      year: String(year),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string }>;
}) {
  const { locale, country, year } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const current = locale as AppLocale;
  if (!getHolidayFile(country, Number(year))) return {};
  const t = await getTranslations({ locale: current, namespace: "seo" });
  const name = countryName(country, current);
  const result = presetResult(current, country, Number(year));
  const best = result.bestOption;
  const description = best
    ? t("bridgesDescription", {
        days: PRESET_VACATION_DAYS,
        country: name,
        year,
        label: best.label,
        total: best.totalDays,
        used: best.vacationDaysUsed,
      })
    : t("bridgesDescriptionEmpty", { country: name, year });

  return pageMetadata({
    locale: current,
    title: t("bridgesTitle", { year, country: name }),
    description,
    path: `/dias-libres/${country.toLowerCase()}/${year}`,
  });
}

function PageFallback() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function BridgesYearPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BridgesYearContent params={params} />
    </Suspense>
  );
}

async function BridgesYearContent({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string }>;
}) {
  const { locale, country, year } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const yearNumber = Number(year);
  if (!getHolidayFile(country, yearNumber)) notFound();
  setRequestLocale(locale);

  const current = locale as AppLocale;
  const name = countryName(country, current);
  const t = await getTranslations({ locale: current, namespace: "bridges" });
  const months = monthsWithContent(country, yearNumber, current);

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("titleIn", { year, country: name })}
        </h1>
        <nav className="flex gap-2 overflow-x-auto pb-1 text-sm" aria-label={t("title", { year })}>
          {months.map((month) => (
            <Link
              key={month}
              href={`/dias-libres/${country.toLowerCase()}/${year}/${monthSlug(month, current)}`}
              className="shrink-0 rounded-full bg-card px-3 py-1 capitalize ring-1 ring-foreground/10"
              prefetch
            >
              {t("seeMonth", { month: monthName(month, current) })}
            </Link>
          ))}
        </nav>
      </div>
      <BridgeSection
        locale={current}
        country={country}
        year={yearNumber}
        heading={t("title", { year })}
      />
      <AdSlot slot="footer" />
    </div>
  );
}
