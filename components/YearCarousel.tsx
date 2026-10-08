"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function YearCarousel({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useTranslations("calculator");
  const index = Math.max(0, years.indexOf(value));
  const previous = years[index - 1];
  const next = years[index + 1];

  return (
    <div className="grid gap-1">
      <p id="year-label" className="text-center text-xs text-muted-foreground">
        {t("year")}
      </p>
      <div role="group" aria-labelledby="year-label" className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("prevYear")}
          disabled={previous === undefined}
          onClick={() => {
            if (previous !== undefined) onChange(previous);
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="grid w-40 grid-cols-3 items-center">
          <span className="text-right text-sm text-muted-foreground tabular-nums" aria-hidden>
            {previous ?? ""}
          </span>
          <span className="text-center text-4xl font-semibold tabular-nums tracking-tight" aria-live="polite">
            {value}
          </span>
          <span className="text-sm text-muted-foreground tabular-nums" aria-hidden>
            {next ?? ""}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("nextYear")}
          disabled={next === undefined}
          onClick={() => {
            if (next !== undefined) onChange(next);
          }}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
