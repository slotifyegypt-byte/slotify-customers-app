import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  isYesterday,
} from 'date-fns';

import i18n from '@/lib/i18n';

// Compact relative-time labels ("2h ago", "Yesterday", "6d ago") to match
// the notifications design (Design.html). Kept centralized here rather than
// per-screen ad-hoc string formatting so any future timestamp list (e.g.
// activity/reviews) can reuse the same rules.
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  if (date > now) return i18n.t('time.justNow');

  if (isYesterday(date)) return i18n.t('time.yesterday');

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) {
    return minutes < 1 ? i18n.t('time.justNow') : i18n.t('time.minutesAgo', { count: minutes });
  }

  const hours = differenceInHours(now, date);
  if (hours < 24) return i18n.t('time.hoursAgo', { count: hours });

  const days = differenceInCalendarDays(now, date);
  return i18n.t('time.daysAgo', { count: days });
}
