"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { monthIndexFromSlug, monthSlug } from "@/lib/months";
import type { AppLocale } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const labels: Record<AppLocale, string> = {
  es: "ES",
  en: "EN",
  pt: "PT",
};

function swapMonth(pathname: string, from: AppLocale, to: AppLocale): string {
  const parts = pathname.split("/");
  const month = parts.at(-1);
  if (!month) return pathname;
  const index = monthIndexFromSlug(month, from);
  if (index === null) return pathname;
  parts[parts.length - 1] = monthSlug(index, to);
  return parts.join("/");
}

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("nav");

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (!value || value === locale) return;
        const nextLocale = value as AppLocale;
        const nextPath = swapMonth(pathname, locale, nextLocale);
        const query = searchParams.toString();
        router.replace(query ? `${nextPath}?${query}` : nextPath, { locale: nextLocale });
      }}
    >
      <SelectTrigger className="w-[4.5rem]" aria-label={t("menu")} size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {(Object.keys(labels) as AppLocale[]).map((code) => (
          <SelectItem key={code} value={code}>
            {labels[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
