import { isApiError } from '@/lib/api/errors';
import i18n from '@/lib/i18n';

/**
 * developer-guide.md §6: the `bookings`/`availability` Edge Functions answer
 * with a real HTTP status and `{ code, message }`, where `message` is human
 * text (e.g. "Choose who should do Haircut."). Show it verbatim when there is
 * one; a bare machine code (`errorResponse(404, 'branch_not_found')` sends
 * message === code) or a non-ApiError gets the caller's fallback instead.
 */
export function getBookingErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error) && error.message && error.message !== error.code) {
    return error.message;
  }
  return fallback;
}

/** 409 `slot_taken` (someone booked it a moment ago) or `slot_unavailable` (outside hours / already taken). */
export function isSlotConflict(error: unknown): boolean {
  return isApiError(error, 'slot_taken') || isApiError(error, 'slot_unavailable');
}

/**
 * Inline message after a slot conflict / `time_in_past` on create. Names the
 * services whose slot was found gone (other draft entries may be the
 * culprit, not the one on screen).
 */
export function slotConflictMessage(
  error: unknown,
  conflicting: { service: { name: string } }[],
): string {
  const names = conflicting.map((entry) => entry.service.name).join(', ');
  if (isApiError(error, 'time_in_past')) {
    const base = getBookingErrorMessage(error, i18n.t('booking.pastTime'));
    return names ? `${names}: ${base}` : base;
  }
  if (isApiError(error, 'slot_unavailable')) {
    // The server says why (e.g. outside working hours); a bare code gets the generic text below.
    const reason = getBookingErrorMessage(error, '');
    if (reason) return names ? `${names}: ${reason}` : reason;
  }
  return names ? i18n.t('booking.takenNamed', { names }) : i18n.t('booking.taken');
}
