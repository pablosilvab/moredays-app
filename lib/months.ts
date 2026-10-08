import type { AppLocale } from "@/lib/types";

const monthSlugs: Record<AppLocale, readonly string[]> = {
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  en: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ],
  pt: [
    "janeiro",
    "fevereiro",
    "marco",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ],
};

const intlLocale: Record<AppLocale, string> = {
  es: "es-CL",
  en: "en",
  pt: "pt-BR",
};

export function monthSlug(monthIndex: number, locale: AppLocale): string {
  return monthSlugs[locale][monthIndex] ?? "";
}

export function monthIndexFromSlug(slug: string, locale: AppLocale): number | null {
  const index = monthSlugs[locale].indexOf(slug.toLowerCase());
  return index === -1 ? null : index;
}

export function monthName(monthIndex: number, locale: AppLocale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, monthIndex, 1)));
}

export function allMonthSlugs(locale: AppLocale): readonly string[] {
  return monthSlugs[locale];
}
