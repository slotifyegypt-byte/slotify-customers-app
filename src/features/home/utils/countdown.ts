// "confirmed" bookings can include ones whose date has already passed (the
// backend doesn't auto-transition status once the slot elapses) — this
// picks the soonest genuinely-future one, so a stale confirmed booking from
// months ago never gets shown as "Next Up". A plain (non-hook) function so
// its `Date.now()` call doesn't trip the React Compiler's purity check,
// which flags impure calls made directly inside a component/hook body.
export function selectNextUpBooking<T extends { booking_date: string }>(bookings: T[] | undefined): T | null {
  const now = Date.now();
  const future = bookings?.filter((b) => new Date(b.booking_date).getTime() > now);
  if (!future?.length) return null;
  return [...future].sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())[0];
}

// Mirrors the design's live "In 45 min" pill on the Next Up card — falls
// back to the booking's own date title (e.g. "Tomorrow") once it's more
// than a few hours out, where a countdown stops being useful at a glance.
export function formatCountdown(bookingDateIso: string, fallback: string): string {
  const minutesUntil = Math.round((new Date(bookingDateIso).getTime() - Date.now()) / 60000);

  if (minutesUntil <= 0) return fallback;
  if (minutesUntil < 60) return `In ${minutesUntil} min`;

  const hours = Math.round(minutesUntil / 60);
  if (hours < 6) return `In ${hours}h`;

  return fallback;
}
