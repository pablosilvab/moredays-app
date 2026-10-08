import { defineRouting } from "next-intl/routing";
import type { AppLocale } from "@/lib/types";

export const routing = defineRouting({
  locales: ["es", "en", "pt"],
  defaultLocale: "es",
  localePrefix: "always",
  localeDetection: true,
});

export const messageFile: Record<AppLocale, string> = {
  es: "es-CL",
  en: "en",
  pt: "pt-BR",
};

export const htmlLang: Record<AppLocale, string> = {
  es: "es-CL",
  en: "en",
  pt: "pt-BR",
};

export function isAppLocale(value: string): value is AppLocale {
  return routing.locales.includes(value as AppLocale);
}

// Reservados para cuando existan mensajes propios: "es-AR", "es-MX".
export const futureLocales = ["es-AR", "es-MX"] as const;
