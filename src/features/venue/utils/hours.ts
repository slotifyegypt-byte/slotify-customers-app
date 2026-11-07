import i18n from '@/lib/i18n';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/** ISO weekday (1 = Monday … 7 = Sunday) -> its name in the app language. */
export function weekdayName(dayOfWeek: number): string {
  return i18n.t(`venue.weekday.${WEEKDAY_KEYS[dayOfWeek - 1] ?? 'mon'}`);
}

// "HH:MM[:SS]" strings of the same width compare correctly as text. A closing
// time earlier than the opening time runs past midnight (developer-guide.md §10).
export function crossesMidnight(opensAt: string, closesAt: string): boolean {
  return closesAt < opensAt;
}

/** "09:00:00" -> "9:00 AM", "00:00:00" -> "12:00 AM". */
export function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${i18n.t(hours < 12 ? 'time.am' : 'time.pm')}`;
}

/** "10:00 PM - 2:00 AM (next day)" when the interval runs past midnight. */
export function formatInterval(opensAt: string, closesAt: string): string {
  const range = `${formatClockTime(opensAt)} - ${formatClockTime(closesAt)}`;
  return crossesMidnight(opensAt, closesAt) ? `${range} ${i18n.t('venue.nextDay')}` : range;
}
