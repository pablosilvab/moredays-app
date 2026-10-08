import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdSlot } from "@/components/AdSlot";
import { BridgeCalculator, type CalculatorInitial } from "@/components/BridgeCalculator";
import { FAQ } from "@/components/FAQ";
import { routing } from "@/i18n/routing";
import { getCountry } from "@/lib/countries";
import { getSupportedYears } from "@/lib/holidays";
import { pageMetadata } from "@/lib/seo";
import {
  DEFAULT_COUNTRY,
  DEFAULT_YEAR,
  MAX_VACATION_DAYS,
  MIN_VACATION_DAYS,
  PRESET_INCLUDE_WEEKENDS,
  PRESET_VACATION_DAYS,
} from "@/lib/site";
import type { AppLocale } from "@/lib/types";
import { clamp } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale: locale as AppLocale,
    title: t("calculatorTitle"),
    description: t("calculatorDescription"),
    path: "/calculadora",
  });
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readInitial(
  searchParams: Record<string, string | string[] | undefined>,
): CalculatorInitial {
  const countryRaw = (first(searchParams.country) ?? DEFAULT_COUNTRY).toUpperCase();
  const country = getCountry(countryRaw)?.supported ? countryRaw : DEFAULT_COUNTRY;
  const years = getSupportedYears(country);
  const requestedYear = Number(first(searchParams.year) ?? DEFAULT_YEAR);
  const year = years.includes(requestedYear) ? requestedYear : (years[0] ?? DEFAULT_YEAR);
  const days = clamp(
    Number(first(searchParams.days) ?? PRESET_VACATION_DAYS),
    MIN_VACATION_DAYS,
    MAX_VACATION_DAYS,
  );
  const weekends = first(searchParams.weekends) === "0" ? false : PRESET_INCLUDE_WEEKENDS;
  const optionId = first(searchParams.option);
  const autorun =
    searchParams.country != null ||
    searchParams.year != null ||
    searchParams.days != null ||
    searchParams.option != null;

  return { country, year, days, weekends, optionId, autorun };
}

async function CalculatorFromQuery({
  locale,
  searchParams,
}: {
  locale: AppLocale;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial = readInitial(await searchParams);
  return <BridgeCalculator locale={locale} initial={initial} />;
}

export default async function CalculatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hero" });

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Suspense
        fallback={
          <BridgeCalculator
            locale={locale as AppLocale}
            initial={{
              country: DEFAULT_COUNTRY,
              year: DEFAULT_YEAR,
              days: PRESET_VACATION_DAYS,
              weekends: PRESET_INCLUDE_WEEKENDS,
            }}
          />
        }
      >
        <CalculatorFromQuery locale={locale as AppLocale} searchParams={searchParams} />
      </Suspense>
      <AdSlot slot="rectangle" />
      <FAQ locale={locale as AppLocale} />
    </div>
  );
}
