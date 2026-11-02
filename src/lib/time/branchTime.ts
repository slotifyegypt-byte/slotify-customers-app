// Booking times are shown in the BRANCH's wall-clock time, never the device's.
//
// This replaces the old fixed "+02:00" Cairo hack in
// the (now deleted) booking/utils/time.ts. That hack existed because the FastAPI
// backend and the app disagreed about Cairo's DST; the Supabase backend stores
// true UTC (`timestamptz`) and publishes each branch's IANA timezone
// (e.g. "Africa/Cairo", "Europe/Warsaw"), so we can convert correctly for any
// branch and any date, DST included.
//
// Every helper takes the branch `timeZone` explicitly — none of them read the
// device zone. An invalid IANA name makes `Intl.DateTimeFormat` throw a
// RangeError and we let it propagate: the zone comes from the database, so a
// bad value is a data bug, and a loud error beats silently showing customers
// the wrong appointment time.

// English month abbreviations are hard-coded (rather than asking Intl for
// them) so the output is identical on every JS engine and locale.
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

type BranchParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
};

// Building an Intl.DateTimeFormat is comparatively expensive and lists render
// many bookings, so keep one per zone.
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      // h23 keeps midnight as 0; 'h24' quirks would otherwise give "24".
      hourCycle: 'h23',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

// Wall-clock digits of `instant` as seen in `timeZone`.
function getBranchParts(instant: Date | string, timeZone: string): BranchParts {
  const date = typeof instant === 'string' ? new Date(instant) : instant;
  const values: Record<string, number> = {};
  for (const part of getFormatter(timeZone).formatToParts(date)) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

function toYmd({ year, month, day }: BranchParts): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Whole days from local date `fromDate` to `toDate` ("YYYY-MM-DD" strings).
// Both are read as UTC midnights, so DST changes (23/25-hour days) in the
// branch zone can never skew the difference.
function daysBetween(fromDate: string, toDate: string): number {
  return Math.round((Date.parse(toDate) - Date.parse(fromDate)) / 86_400_000);
}

/** The branch-local calendar date ("YYYY-MM-DD") of an instant. */
export function branchLocalDate(instant: Date | string, timeZone: string): string {
  return toYmd(getBranchParts(instant, timeZone));
}

/** Today's branch-local date ("YYYY-MM-DD"); `now` is injectable for tests. */
export function branchToday(timeZone: string, now: Date = new Date()): string {
  return branchLocalDate(now, timeZone);
}

/** Branch-local time of day, e.g. "10:00 AM". */
export function formatHour(iso: string, timeZone: string): string {
  const { hour, minute } = getBranchParts(iso, timeZone);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const amPm = hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minute).padStart(2, '0')} ${amPm}`;
}

/** Branch-local date, e.g. "25 Sep. 2026". */
export function formatDate(iso: string, timeZone: string): string {
  const { year, month, day } = getBranchParts(iso, timeZone);
  return `${String(day).padStart(2, '0')} ${MONTH_ABBR[month - 1]}. ${year}`;
}

/** Relative title for a booking, e.g. "Tomorrow Morning", "In 3 days", "2 days ago". */
export function formatDateTitle(iso: string, timeZone: string, now: Date = new Date()): string {
  const target = getBranchParts(iso, timeZone);
  const daysDiff = daysBetween(branchToday(timeZone, now), toYmd(target));
  const timeOfDay = target.hour < 12 ? 'Morning' : 'Afternoon'; // TODO i18n

  if (daysDiff === 0) return `Today ${timeOfDay}`; // TODO i18n
  if (daysDiff === 1) return `Tomorrow ${timeOfDay}`; // TODO i18n
  if (daysDiff > 1) return `In ${daysDiff} days`; // TODO i18n
  return `${Math.abs(daysDiff)} days ago`; // TODO i18n
}
