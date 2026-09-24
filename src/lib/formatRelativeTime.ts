import { differenceInCalendarDays, differenceInHours, differenceInMinutes, isYesterday } from 'date-fns';

// Compact relative-time labels ("2h ago", "Yesterday", "6d ago") to match
// the notifications design (Design.html). Kept centralized here rather than
// per-screen ad-hoc string formatting so any future timestamp list (e.g.
// activity/reviews) can reuse the same rules.
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  if (date > now) return 'Just now'; // TODO i18n

  if (isYesterday(date)) return 'Yesterday'; // TODO i18n

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return minutes < 1 ? 'Just now' : `${minutes}m ago`; // TODO i18n
  }

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h ago`; // TODO i18n

  const days = differenceInCalendarDays(now, date);
  return `${days}d ago`; // TODO i18n
}
