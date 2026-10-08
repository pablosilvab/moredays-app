import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdSlot } from "@/components/AdSlot";
import { BridgeCalculator } from "@/components/BridgeCalculator";
import { FAQ } from "@/components/FAQ";
import { HolidayList } from "@/components/HolidayList";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { routing } from "@/i18n/routing";
import { getHolidayFile } from "@/lib/holidays";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { DEFAULT_COUNTRY, DEFAULT_YEAR, PRESET_INCLUDE_WEEKENDS, PRESET_VACATION_DAYS } from "@/lib/site";
import type { AppLocale } from "@/lib/types";
import { countryName } from "@/lib/countries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale: locale as AppLocale,
    title: t("homeTitle"),
    description: t("homeDescription"),
    path: "/",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const current = locale as AppLocale;
  const t = await getTranslations({ locale: current, namespace: "hero" });
  const holidayFile = getHolidayFile(DEFAULT_COUNTRY, DEFAULT_YEAR);

  return (
    <div className="grid gap-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "MoreDays",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: absoluteUrl(current, "/"),
          description: t("subtitle"),
        }}
      />
      <section className="grid gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{t("title")}</h1>
          <p className="max-w-xl text-muted-foreground">{t("subtitle")}</p>
        </div>
        <BridgeCalculator
          locale={current}
          initial={{
            country: DEFAULT_COUNTRY,
            year: DEFAULT_YEAR,
            days: PRESET_VACATION_DAYS,
            weekends: PRESET_INCLUDE_WEEKENDS,
          }}
        />
      </section>
      <AdSlot slot="leaderboard" />
      <HowItWorks locale={current} />
      <HolidayList
        locale={current}
        holidayFile={holidayFile}
        countryName={countryName(DEFAULT_COUNTRY, current)}
      />
      <AdSlot slot="rectangle" />
      <FAQ locale={current} />
      <AdSlot slot="footer" />
    </div>
  );
}
