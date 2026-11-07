import i18n from '@/lib/i18n';
import { branchToday } from '@/lib/time/branchTime';

// Calendar dates the customer picks while booking are BRANCH-local
// "YYYY-MM-DD" strings (the availability `date` param is the branch's local
// date — developer-guide.md §6). Everything here does plain calendar
// arithmetic on those strings, reading them as UTC midnights, so neither the
// phone's zone nor a DST change can shift a day.

// English fallbacks, used when the engine's Intl can't format the locale.
const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function ymdToUtc(ymd: string): Date {
  return new Date(`${ymd}T00:00:00Z`);
}

// Weekday and month names follow the app language (Arabic readers get Arabic names). `ymd` dates are UTC
// midnights, so formatting in UTC reads the same calendar day on every phone.
const intlLocale = () => (i18n.language?.startsWith('ar') ? 'ar' : 'en-US');

function weekdayShort(date: Date): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(), { weekday: 'short', timeZone: 'UTC' }).format(
      date,
    );
  } catch {
    return WEEKDAY_ABBR[date.getUTCDay()];
  }
}

function monthDayLabel(date: Date): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return `${WEEKDAY_ABBR[date.getUTCDay()]}, ${MONTH_ABBR[date.getUTCMonth()]} ${date.getUTCDate()}`;
  }
}

/** `ymd` plus `days` calendar days, e.g. ("2026-11-30", 1) -> "2026-12-01". */
export function addDaysToDate(ymd: string, days: number): string {
  const date = ymdToUtc(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export interface StripDate {
  /** Branch-local "YYYY-MM-DD" — what the availability call takes. */
  value: string;
  /** "Mon" … "Sun". */
  weekday: string;
  /** Day of month without padding, e.g. "3". */
  day: string;
}

/** The next `daysAhead` days starting from the branch's today (not the phone's). */
export function branchDateStrip(
  timeZone: string,
  daysAhead = 14,
  now: Date = new Date(),
): StripDate[] {
  const today = branchToday(timeZone, now);
  return Array.from({ length: daysAhead }, (_, i) => {
    const value = addDaysToDate(today, i);
    const date = ymdToUtc(value);
    return { value, weekday: weekdayShort(date), day: String(date.getUTCDate()) };
  });
}

/** "YYYY-MM-DD" -> "Today" / "Tomorrow" / "Mon, Jan 5", relative to the branch's today. */
export function formatDraftDateLabel(
  ymd: string,
  timeZone: string,
  now: Date = new Date(),
): string {
  const today = branchToday(timeZone, now);
  if (ymd === today) return i18n.t('booking.today');
  if (ymd === addDaysToDate(today, 1)) return i18n.t('booking.tomorrow');
  return monthDayLabel(ymdToUtc(ymd));
}
