"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { AppLocale } from "@/lib/types";

export function ShareButton({
  locale,
  country,
  year,
  vacationDays,
  includeWeekends,
  optionId,
  label,
}: {
  locale: AppLocale;
  country: string;
  year: number;
  vacationDays: number;
  includeWeekends: boolean;
  optionId: string;
  label: string;
}) {
  const t = useTranslations("calculator");
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = new URL(`/${locale}/calculadora`, window.location.origin);
    url.searchParams.set("country", country.toLowerCase());
    url.searchParams.set("year", String(year));
    url.searchParams.set("days", String(vacationDays));
    url.searchParams.set("weekends", includeWeekends ? "1" : "0");
    url.searchParams.set("option", optionId);

    if (navigator.share) {
      try {
        await navigator.share({ title: "MoreDays", text: label, url: url.toString() });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onShare}>
      {copied ? t("copied") : t("share")}
    </Button>
  );
}
