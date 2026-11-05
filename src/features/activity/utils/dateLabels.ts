import { branchLocalDate, branchToday } from '@/lib/time/branchTime';

// Calendar labels for bookings and chat. Everything is read in the BRANCH's time zone (never the phone's) and
// localised through Intl, so Arabic readers get Arabic weekday and month names. Clock times come from
// `formatHour` in `@/lib/time/branchTime`.

export interface RelativeWords {
  today: string;
  tomorrow: string;
  yesterday: string;
}

// Whole days from branch-local date `from` to `to` ("YYYY-MM-DD"). Read as UTC midnights, so DST never skews it.
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

// A branch-local "YYYY-MM-DD" as a UTC-midnight Date: formatting it with timeZone UTC reads the same calendar day.
function dayAsUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00Z`);
}

// Day-before-month for English, as the rest of the app prints dates ("25 Sep. 2026").
const intlLocale = (locale: string) => (locale.startsWith('en') ? 'en-GB' : locale);

function formatDay(ymd: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: 'UTC' }).format(
      dayAsUtc(ymd),
    );
  } catch {
    return ymd;
  }
}

/**
 * "Today", "Tomorrow", "Yesterday", otherwise a short date such as "Thu, 5 Nov" (with the year when it is not the
 * branch's current year).
 */
export function dayLabel(
  iso: string,
  timeZone: string,
  locale: string,
  words: RelativeWords,
  now: Date = new Date(),
): string {
  const day = branchLocalDate(iso, timeZone);
  const today = branchToday(timeZone, now);
  const diff = daysBetween(today, day);
  if (diff === 0) return words.today;
  if (diff === 1) return words.tomorrow;
  if (diff === -1) return words.yesterday;
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  return formatDay(day, locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** "Thursday, 5 November": the hero date on a booking. */
export function longDayLabel(iso: string, timeZone: string, locale: string): string {
  return formatDay(branchLocalDate(iso, timeZone), locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** "October 2026": the heading over a month of past bookings. */
export function monthHeading(iso: string, timeZone: string, locale: string): string {
  return formatDay(branchLocalDate(iso, timeZone), locale, { month: 'long', year: 'numeric' });
}

/** Whole branch-local days from today to the instant: 0 today, 1 tomorrow, negative for the past. */
export function daysFromToday(iso: string, timeZone: string, now: Date = new Date()): number {
  return daysBetween(branchToday(timeZone, now), branchLocalDate(iso, timeZone));
}
