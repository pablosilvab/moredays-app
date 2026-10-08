export const holidayTypes = ["national", "regional", "bank", "observance"] as const;

export type HolidayType = (typeof holidayTypes)[number];

export type AppLocale = "es" | "en" | "pt";

export type LocalizedName = Record<AppLocale, string>;

export type Holiday = {
  date: string | null;
  name: LocalizedName;
  type: HolidayType;
};

export type HolidayFile = {
  country: string;
  countryName: LocalizedName;
  year: number;
  source: string;
  last_updated: string;
  holidays: Holiday[];
};

export type OptimizationInput = {
  year: number;
  country: string;
  vacationDays: number;
  includeWeekends: boolean;
  locale: AppLocale;
};

export type BridgeKind = "bridge" | "free" | "full-week";

export type BridgeOption = {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  vacationDaysUsed: number;
  holidaysIncluded: { date: string; name: string }[];
  efficiency: number;
  label: string;
  kind: BridgeKind;
};

export type OptimizationResult = {
  options: BridgeOption[];
  freeOptions: BridgeOption[];
  bestOption: BridgeOption | null;
  allHolidays: Holiday[];
};
