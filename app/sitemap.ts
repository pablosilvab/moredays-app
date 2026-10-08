import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { supportedCountries } from "@/lib/countries";
import { monthsWithContent } from "@/lib/content";
import { getSupportedYears } from "@/lib/holidays";
import { monthSlug } from "@/lib/months";
import { absoluteUrl } from "@/lib/seo";
import type { AppLocale } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales as unknown as AppLocale[];
  const staticPaths = ["/", "/calculadora", "/about", "/privacy", "/terms"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({ url: absoluteUrl(locale, path), changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 });
    }

    for (const country of supportedCountries()) {
      for (const year of getSupportedYears(country.code)) {
        const code = country.code.toLowerCase();
        entries.push({
          url: absoluteUrl(locale, `/feriados/${code}/${year}`),
          changeFrequency: "yearly",
          priority: 0.8,
        });
        entries.push({
          url: absoluteUrl(locale, `/dias-libres/${code}/${year}`),
          changeFrequency: "yearly",
          priority: 0.8,
        });
        for (const month of monthsWithContent(country.code, year, locale)) {
          entries.push({
            url: absoluteUrl(locale, `/dias-libres/${code}/${year}/${monthSlug(month, locale)}`),
            changeFrequency: "yearly",
            priority: 0.6,
          });
        }
      }
    }
  }

  return entries;
}
