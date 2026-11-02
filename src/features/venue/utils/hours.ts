export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // TODO i18n

// "HH:MM[:SS]" strings of the same width compare correctly as text. A closing
// time earlier than the opening time runs past midnight (developer-guide.md §10).
export function crossesMidnight(opensAt: string, closesAt: string): boolean {
  return closesAt < opensAt;
}

/** "09:00:00" -> "9:00 AM", "00:00:00" -> "12:00 AM". */
export function formatClockTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** "10:00 PM - 2:00 AM (next day)" when the interval runs past midnight. */
export function formatInterval(opensAt: string, closesAt: string): string {
  const range = `${formatClockTime(opensAt)} - ${formatClockTime(closesAt)}`;
  return crossesMidnight(opensAt, closesAt) ? `${range} (next day)` : range; // TODO i18n
}
