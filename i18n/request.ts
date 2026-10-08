import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/types";

async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case "en":
      return (await import("../messages/en.json")).default;
    case "pt":
      return (await import("../messages/pt-BR.json")).default;
    default:
      return (await import("../messages/es-CL.json")).default;
  }
}

export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;
  if (!resolved) {
    const paramValue = await rootLocale();
    if (hasLocale(routing.locales, paramValue)) resolved = paramValue;
  }

  const current: AppLocale = hasLocale(routing.locales, resolved)
    ? (resolved as AppLocale)
    : routing.defaultLocale;

  return {
    locale: current,
    messages: await loadMessages(current),
  };
});
