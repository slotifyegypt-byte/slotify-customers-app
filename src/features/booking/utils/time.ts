import { format, isToday, isTomorrow, parseISO } from 'date-fns';

// customer-app-api-map.md §6: GET /availability returns naive local
// timestamps with no UTC offset (e.g. "2026-09-10T13:00:00"). A fixed
// +02:00 is appended when turning one into a create-booking payload, and
// the SAME fixed offset is used below to turn a booking's stored UTC
// instant back into display strings — deliberately, not because Egypt is
// actually DST-free (it isn't, as of 2023): the backend's real
// zoneinfo("Africa/Cairo") conversion disagrees with this fixed offset
// during Cairo's DST season, which is exactly what caused a booked "10:00
// AM" to read back as "11:00 AM" after a backend fix used real DST-aware
// localization on read while the write side still assumes a flat +02:00.
// As long as encode and decode use the identical fixed offset, what the
// customer picked is exactly what they see again, regardless of whether
// that offset is astronomically correct for the date in question.
const CAIRO_OFFSET = '+02:00';
const CAIRO_OFFSET_MINUTES = 2 * 60;
const HAS_OFFSET_OR_ZULU = /[Zz]|[+-]\d{2}:\d{2}$/;

export function toBookingTimestamp(naiveIsoString: string): string {
  if (HAS_OFFSET_OR_ZULU.test(naiveIsoString)) {
    return naiveIsoString;
  }
  return `${naiveIsoString}${CAIRO_OFFSET}`;
}

/** yyyy-MM-dd -> "Today" / "Tomorrow" / "Mon, Jan 5", for a date the customer is picking client-side (not yet an API-provided `booking_date_title`). */
export function formatDraftDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today'; // TODO i18n
  if (isTomorrow(date)) return 'Tomorrow'; // TODO i18n
  return format(date, 'EEE, MMM d');
}

// Shifts an aware API timestamp (e.g. "2026-09-25T08:00:00+00:00") by the
// same fixed Cairo offset used on write, then reads its wall-clock digits
// via the UTC getters — this sidesteps both the device's own local time
// zone and any DST rules a JS/ICU timezone database might apply, so the
// result only ever depends on the fixed offset above.
function toCairoParts(isoString: string) {
  const shifted = new Date(new Date(isoString).getTime() + CAIRO_OFFSET_MINUTES * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hours: shifted.getUTCHours(),
    minutes: shifted.getUTCMinutes(),
  };
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Client-side equivalent of the API's `booking_hour_str` (e.g. "10:00 AM"), computed from the raw `booking_date`/timestamp field instead of trusting the backend's own formatting. */
export function formatBookingHourStr(isoString: string): string {
  const { hours, minutes } = toCairoParts(isoString);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const amPm = hours < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(minutes).padStart(2, '0')} ${amPm}`;
}

/** Client-side equivalent of the API's `booking_date_str` (e.g. "25 Sep. 2026"). */
export function formatBookingDateStr(isoString: string): string {
  const { year, month, day } = toCairoParts(isoString);
  return `${String(day).padStart(2, '0')} ${MONTH_ABBR[month]}. ${year}`;
}

/** Client-side equivalent of the API's `booking_date_title` (e.g. "Tomorrow Morning", "In 3 days"). */
export function formatBookingDateTitle(isoString: string): string {
  const target = toCairoParts(isoString);
  const now = toCairoParts(new Date().toISOString());
  const targetDay = Date.UTC(target.year, target.month, target.day);
  const nowDay = Date.UTC(now.year, now.month, now.day);
  const daysDiff = Math.round((targetDay - nowDay) / 86_400_000);
  const timeOfDay = target.hours < 12 ? 'Morning' : 'Afternoon'; // TODO i18n

  if (daysDiff === 0) return `Today ${timeOfDay}`; // TODO i18n
  if (daysDiff === 1) return `Tomorrow ${timeOfDay}`; // TODO i18n
  if (daysDiff > 1) return `In ${daysDiff} days`; // TODO i18n
  return `${Math.abs(daysDiff)} days ago`; // TODO i18n
}
