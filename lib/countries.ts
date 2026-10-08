import type { AppLocale, LocalizedName } from "@/lib/types";

export type Country = {
  code: string;
  supported: boolean;
  flag: string;
  names: LocalizedName;
};

export const countries: Country[] = [
  { code: "CL", supported: true, flag: "🇨🇱", names: { es: "Chile", en: "Chile", pt: "Chile" } },
  { code: "AR", supported: false, flag: "🇦🇷", names: { es: "Argentina", en: "Argentina", pt: "Argentina" } },
  { code: "MX", supported: false, flag: "🇲🇽", names: { es: "México", en: "Mexico", pt: "México" } },
  { code: "ES", supported: false, flag: "🇪🇸", names: { es: "España", en: "Spain", pt: "Espanha" } },
  { code: "BR", supported: false, flag: "🇧🇷", names: { es: "Brasil", en: "Brazil", pt: "Brasil" } },
  { code: "PE", supported: false, flag: "🇵🇪", names: { es: "Perú", en: "Peru", pt: "Peru" } },
  { code: "CO", supported: false, flag: "🇨🇴", names: { es: "Colombia", en: "Colombia", pt: "Colômbia" } },
];

export function getCountry(code: string): Country | undefined {
  return countries.find((country) => country.code === code.toUpperCase());
}

export function supportedCountries(): Country[] {
  return countries.filter((country) => country.supported);
}

export function countryName(code: string, locale: AppLocale): string {
  return getCountry(code)?.names[locale] ?? code.toUpperCase();
}
