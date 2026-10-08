"use client";

import { useTranslations } from "next-intl";
import { Flag } from "@/components/Flag";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { countries } from "@/lib/countries";
import type { AppLocale } from "@/lib/types";

export function CountrySelector({
  locale,
  value,
  onChange,
}: {
  locale: AppLocale;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("calculator");
  const selected = countries.find((country) => country.code === value);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="country">{t("country")}</Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
      >
        <SelectTrigger id="country" className="h-12 w-full" aria-label={t("country")}>
          <span className="flex items-center gap-3">
            <Flag code={selected?.code ?? value} className="h-6 w-9 shrink-0 rounded-sm ring-1 ring-foreground/15" />
            <span className="text-base">{selected?.names[locale]}</span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code} disabled={!country.supported}>
              <Flag code={country.code} className="h-4 w-6 shrink-0 rounded-sm ring-1 ring-foreground/15" />
              <span>{country.names[locale]}</span>
              {!country.supported ? <span className="text-muted-foreground">{t("comingSoon")}</span> : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
