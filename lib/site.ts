// TODO: define NEXT_PUBLIC_SITE_URL con el dominio real antes de producción.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://moredays.vercel.app"
).replace(/\/$/, "");

const adsenseFromEnv = process.env.NEXT_PUBLIC_ADSENSE_ID;
export const adsenseClient =
  adsenseFromEnv && /^ca-pub-\d+$/.test(adsenseFromEnv)
    ? adsenseFromEnv
    : "ca-pub-5842491442798334";

export const PRESET_VACATION_DAYS = 5;
export const PRESET_INCLUDE_WEEKENDS = true;
export const DEFAULT_COUNTRY = "CL";
export const DEFAULT_YEAR = 2027;
export const MIN_VACATION_DAYS = 0;
export const MAX_VACATION_DAYS = 15;
export const VISIBLE_OPTIONS = 3;
export const VISIBLE_FREE_OPTIONS = 3;
