import type { Metadata } from "next";
import { htmlLang, routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";
import type { AppLocale } from "@/lib/types";

export function localizedPath(locale: AppLocale, path: string): string {
  if (path === "" || path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteUrl(locale: AppLocale, path: string): string {
  return `${siteUrl}${localizedPath(locale, path)}`;
}

export function languageAlternates(pathForLocale: (locale: AppLocale) => string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[htmlLang[locale as AppLocale]] = absoluteUrl(
      locale as AppLocale,
      pathForLocale(locale as AppLocale),
    );
  }
  languages["x-default"] = absoluteUrl("es", pathForLocale("es"));
  return languages;
}

export function pageMetadata(input: {
  locale: AppLocale;
  title: string;
  description: string;
  path: string;
  pathForLocale?: (locale: AppLocale) => string;
}): Metadata {
  const canonical = absoluteUrl(input.locale, input.path);
  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: languageAlternates(input.pathForLocale ?? (() => input.path)),
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: "MoreDays",
      locale: htmlLang[input.locale].replace("-", "_"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}
