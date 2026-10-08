import cl2027 from "@/data/holidays/cl-2027.json";
import type { Holiday, HolidayFile } from "@/lib/types";

const files = [cl2027] as HolidayFile[];

export function listHolidayFiles(): HolidayFile[] {
  return files;
}

export function getHolidayFile(country: string, year: number): HolidayFile | null {
  return (
    files.find(
      (file) => file.country.toUpperCase() === country.toUpperCase() && file.year === year,
    ) ?? null
  );
}

export function getSupportedYears(country: string): number[] {
  return files
    .filter((file) => file.country.toUpperCase() === country.toUpperCase())
    .map((file) => file.year)
    .sort((a, b) => a - b);
}

export function holidayFilesForCountry(country: string): HolidayFile[] {
  return files.filter((file) => file.country.toUpperCase() === country.toUpperCase());
}

export function nationalHolidaysAround(country: string, year: number): Holiday[] {
  return [year - 1, year, year + 1].flatMap((candidate) => {
    const file = getHolidayFile(country, candidate);
    if (!file) return [];
    return file.holidays.filter((holiday) => holiday.type === "national" && holiday.date);
  });
}
