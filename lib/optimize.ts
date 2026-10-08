import { addDays, diffDays, formatISODate, isWeekend, parseISODate, utcDate } from "@/lib/dates";
import { getHolidayFile, nationalHolidaysAround } from "@/lib/holidays";
import { monthName } from "@/lib/months";
import type {
  AppLocale,
  BridgeOption,
  Holiday,
  OptimizationInput,
  OptimizationResult,
} from "@/lib/types";

const WINDOW_DAYS = 40;
const MAX_OPTIONS = 10;
const FULL_WEEK_THRESHOLD = 5;

type Draft = {
  start: Date;
  end: Date;
  totalDays: number;
  vacationDaysUsed: number;
  holidaysIncluded: { date: string; name: string }[];
  calendarDays: number;
  weekdayCount: number;
};

function holidayKey(dates: { date: string }[]): string {
  return dates.map((holiday) => holiday.date).join(",");
}

function formatLabel(start: Date, end: Date, locale: AppLocale): string {
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();
  const startMonth = monthName(start.getUTCMonth(), locale);
  const endMonth = monthName(end.getUTCMonth(), locale);
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();

  if (locale === "en") {
    if (sameMonth) return `${startMonth} ${startDay}–${endDay}`;
    if (sameYear) return `${startMonth} ${startDay} to ${endMonth} ${endDay}`;
    return `${startMonth} ${startDay}, ${start.getUTCFullYear()} to ${endMonth} ${endDay}, ${end.getUTCFullYear()}`;
  }

  const joiner = locale === "pt" ? "a" : "al";
  if (sameMonth) return `${startDay} ${joiner} ${endDay} de ${startMonth}`;
  if (sameYear) {
    return `${startDay} de ${startMonth} ${joiner} ${endDay} de ${endMonth}`;
  }
  return `${startDay} de ${startMonth} de ${start.getUTCFullYear()} ${joiner} ${endDay} de ${endMonth} de ${end.getUTCFullYear()}`;
}

function rangeCost(start: Date, end: Date, holidayDates: Set<string>): number {
  let cost = 0;
  const count = diffDays(start, end) + 1;
  for (let index = 0; index < count; index += 1) {
    const day = addDays(start, index);
    if (!isWeekend(day) && !holidayDates.has(formatISODate(day))) cost += 1;
  }
  return cost;
}

function isNaturallyFree(date: Date, holidayDates: Set<string>): boolean {
  return isWeekend(date) || holidayDates.has(formatISODate(date));
}

function expand(start: Date, end: Date, holidayDates: Set<string>): [Date, Date] {
  let nextStart = start;
  let nextEnd = end;
  for (let index = 0; index < 14; index += 1) {
    const previous = addDays(nextStart, -1);
    if (!isNaturallyFree(previous, holidayDates)) break;
    nextStart = previous;
  }
  for (let index = 0; index < 14; index += 1) {
    const next = addDays(nextEnd, 1);
    if (!isNaturallyFree(next, holidayDates)) break;
    nextEnd = next;
  }
  return [nextStart, nextEnd];
}

function describe(
  start: Date,
  end: Date,
  holidayDates: Set<string>,
  holidayByDate: Map<string, Holiday>,
  includeWeekends: boolean,
  locale: AppLocale,
): Draft {
  let vacationDaysUsed = 0;
  let weekdayCount = 0;
  const holidaysIncluded: { date: string; name: string }[] = [];
  const calendarDays = diffDays(start, end) + 1;

  for (let index = 0; index < calendarDays; index += 1) {
    const day = addDays(start, index);
    const iso = formatISODate(day);
    const holiday = holidayByDate.get(iso);
    if (!isWeekend(day)) {
      weekdayCount += 1;
      if (!holiday) vacationDaysUsed += 1;
    }
    if (holiday?.date) {
      holidaysIncluded.push({ date: holiday.date, name: holiday.name[locale] });
    }
  }

  return {
    start,
    end,
    totalDays: includeWeekends ? calendarDays : weekdayCount,
    vacationDaysUsed,
    holidaysIncluded,
    calendarDays,
    weekdayCount,
  };
}

function toOption(draft: Draft, locale: AppLocale, kind: BridgeOption["kind"]): BridgeOption {
  const efficiency =
    draft.vacationDaysUsed === 0
      ? Number.POSITIVE_INFINITY
      : draft.totalDays / draft.vacationDaysUsed;

  return {
    id: `${formatISODate(draft.start)}_${formatISODate(draft.end)}_${draft.vacationDaysUsed}`,
    startDate: formatISODate(draft.start),
    endDate: formatISODate(draft.end),
    totalDays: draft.totalDays,
    vacationDaysUsed: draft.vacationDaysUsed,
    holidaysIncluded: draft.holidaysIncluded,
    efficiency,
    label: formatLabel(draft.start, draft.end, locale),
    kind,
  };
}

function compareOptions(a: BridgeOption, b: BridgeOption): number {
  if (b.totalDays !== a.totalDays) return b.totalDays - a.totalDays;
  const efficiencyA = Number.isFinite(a.efficiency) ? a.efficiency : Number.POSITIVE_INFINITY;
  const efficiencyB = Number.isFinite(b.efficiency) ? b.efficiency : Number.POSITIVE_INFINITY;
  if (efficiencyB !== efficiencyA) return efficiencyB - efficiencyA;
  if (a.vacationDaysUsed !== b.vacationDaysUsed) return a.vacationDaysUsed - b.vacationDaysUsed;
  if (b.holidaysIncluded.length !== a.holidaysIncluded.length) {
    return b.holidaysIncluded.length - a.holidaysIncluded.length;
  }
  return a.startDate.localeCompare(b.startDate);
}

function pareto(options: BridgeOption[]): BridgeOption[] {
  return options.filter(
    (candidate) =>
      !options.some(
        (other) =>
          other.id !== candidate.id &&
          other.totalDays >= candidate.totalDays &&
          other.vacationDaysUsed <= candidate.vacationDaysUsed &&
          (other.totalDays > candidate.totalDays ||
            other.vacationDaysUsed < candidate.vacationDaysUsed),
      ),
  );
}

function findCleanMonday(year: number, holidayDates: Set<string>, spanWeeks: number): Date | null {
  let monday = utcDate(year, 2, 1);
  while (monday.getUTCDay() !== 1) monday = addDays(monday, 1);

  for (let week = 0; week < 30; week += 1) {
    const start = addDays(monday, week * 7);
    let clean = true;
    for (let day = 0; day < spanWeeks * 5; day += 1) {
      const cursor = addDays(start, day + Math.floor(day / 5) * 2);
      if (holidayDates.has(formatISODate(cursor))) {
        clean = false;
        break;
      }
    }
    if (clean && start.getUTCFullYear() === year) return start;
  }
  return null;
}

function addFullWeek(
  monday: Date,
  weeks: number,
  holidayDates: Set<string>,
  holidayByDate: Map<string, Holiday>,
  includeWeekends: boolean,
  locale: AppLocale,
  bucket: Map<string, BridgeOption>,
) {
  const start = addDays(monday, -2);
  const end = addDays(monday, weeks * 7 - 1);
  const [expandedStart, expandedEnd] = expand(start, end, holidayDates);
  const draft = describe(
    expandedStart,
    expandedEnd,
    holidayDates,
    holidayByDate,
    includeWeekends,
    locale,
  );
  bucket.set(draftKey(draft), toOption(draft, locale, "full-week"));
}

function draftKey(draft: Draft): string {
  return `${formatISODate(draft.start)}|${formatISODate(draft.end)}|${draft.vacationDaysUsed}`;
}

export function optimize(input: OptimizationInput): OptimizationResult {
  const yearFile = getHolidayFile(input.country, input.year);
  const allHolidays = yearFile?.holidays ?? [];
  const usable = nationalHolidaysAround(input.country, input.year).filter(
    (holiday): holiday is Holiday & { date: string } => Boolean(holiday.date),
  );

  const holidayDates = new Set(usable.map((holiday) => holiday.date));
  const holidayByDate = new Map(usable.map((holiday) => [holiday.date, holiday]));
  const anchors = usable.filter((holiday) => holiday.date.startsWith(String(input.year)));
  const budget = Math.max(0, Math.floor(input.vacationDays));
  const paid = new Map<string, BridgeOption>();
  const free = new Map<string, BridgeOption>();

  function remember(draft: Draft) {
    if (draft.vacationDaysUsed > budget) return;
    if (draft.vacationDaysUsed === 0) {
      if (draft.calendarDays < 3 || draft.weekdayCount === 0) return;
      free.set(draftKey(draft), toOption(draft, input.locale, "free"));
      return;
    }
    if (draft.holidaysIncluded.length === 0) return;
    if (draft.totalDays <= draft.vacationDaysUsed) return;
    paid.set(draftKey(draft), toOption(draft, input.locale, "bridge"));
  }

  for (const anchor of anchors) {
    const anchorDate = parseISODate(anchor.date);
    for (let before = 0; before <= WINDOW_DAYS; before += 1) {
      const start = addDays(anchorDate, -before);
      if (rangeCost(start, anchorDate, holidayDates) > budget) break;
      for (let after = 0; after <= WINDOW_DAYS; after += 1) {
        const end = addDays(anchorDate, after);
        if (rangeCost(anchorDate, end, holidayDates) > budget) break;
        if (rangeCost(start, end, holidayDates) > budget) break;
        const [expandedStart, expandedEnd] = expand(start, end, holidayDates);
        remember(
          describe(
            expandedStart,
            expandedEnd,
            holidayDates,
            holidayByDate,
            input.includeWeekends,
            input.locale,
          ),
        );
      }
    }
  }

  const holidayBridges = [...paid.values()].filter((option) => option.kind === "bridge");
  if (holidayBridges.length < FULL_WEEK_THRESHOLD && budget >= 5) {
    const oneWeek = findCleanMonday(input.year, holidayDates, 1);
    if (oneWeek) {
      addFullWeek(
        oneWeek,
        1,
        holidayDates,
        holidayByDate,
        input.includeWeekends,
        input.locale,
        paid,
      );
    }
    if (budget >= 10) {
      const twoWeeks = findCleanMonday(input.year, holidayDates, 2);
      if (twoWeeks) {
        addFullWeek(
          twoWeeks,
          2,
          holidayDates,
          holidayByDate,
          input.includeWeekends,
          input.locale,
          paid,
        );
      }
    }
  }

  const sorted = pareto([...paid.values()]).sort(compareOptions);
  const unique: BridgeOption[] = [];
  const seenStats = new Set<string>();
  for (const option of sorted) {
    const statsKey = `${option.kind}|${holidayKey(option.holidaysIncluded)}|${option.totalDays}|${option.vacationDaysUsed}`;
    if (seenStats.has(statsKey)) continue;
    seenStats.add(statsKey);
    unique.push(option);
  }

  const groups = new Map<string, BridgeOption[]>();
  for (const option of unique) {
    const key =
      option.kind === "full-week" ? `week-${option.vacationDaysUsed}` : holidayKey(option.holidaysIncluded);
    const list = groups.get(key) ?? [];
    list.push(option);
    groups.set(key, list);
  }

  const picked: BridgeOption[] = [];
  for (const list of groups.values()) {
    const longest = list[0];
    const efficient = list.reduce((best, option) =>
      option.efficiency > best.efficiency ? option : best,
    );
    picked.push(longest);
    if (efficient.id !== longest.id) picked.push(efficient);
  }

  const options = picked.sort(compareOptions).slice(0, MAX_OPTIONS);
  const freeOptions = [...free.values()].sort(compareOptions);
  const bestOption = unique[0] ?? freeOptions[0] ?? null;

  return { options, freeOptions, bestOption, allHolidays };
}

export function overlapsMonth(option: BridgeOption, year: number, monthIndex: number): boolean {
  const start = parseISODate(option.startDate).getTime();
  const end = parseISODate(option.endDate).getTime();
  const monthStart = Date.UTC(year, monthIndex, 1);
  const monthEnd = Date.UTC(year, monthIndex + 1, 0);
  return end >= monthStart && start <= monthEnd;
}
