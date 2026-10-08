import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HolidayList } from "@/components/HolidayList";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { countryName, supportedCountries } from "@/lib/countries";
import { getHolidayFile, getSupportedYears } from "@/lib/holidays";
import { pageMetadata } from "@/lib/seo";
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
  const holidayFile = getHolidayFile(country, Number(year));
  if (!holidayFile) return {};
  const t = await getTranslations({ locale: current, namespace: "seo" });
  const name = countryName(country, current);
  const path = `/feriados/${country.toLowerCase()}/${year}`;
  return pageMetadata({
    locale: current,
    title: t("holidaysTitle", { year, country: name }),
    description: t("holidaysDescription", { year, country: name }),
    path,
  });
}

function PageFallback() {
  return (
    <div className="grid gap-4" aria-busy="true">
      <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
      <div className="h-72 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export default function HolidaysPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback />}>
      <HolidaysContent params={params} />
    </Suspense>
  );
}

async function HolidaysContent({
  params,
}: {
  params: Promise<{ locale: string; country: string; year: string }>;
}) {
  const { locale, country, year } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const yearNumber = Number(year);
  const holidayFile = getHolidayFile(country, yearNumber);
  if (!holidayFile) notFound();
  setRequestLocale(locale);

  const current = locale as AppLocale;
  const name = countryName(country, current);
  const bridges = await getTranslations({ locale: current, namespace: "bridges" });

  return (
    <div className="grid gap-6">
      <HolidayList locale={current} holidayFile={holidayFile} countryName={name} />
      <Link href={`/dias-libres/${country.toLowerCase()}/${year}`} className="text-sm text-primary underline-offset-4 hover:underline">
        {bridges("titleIn", { year, country: name })}
      </Link>
    </div>
  );
}
