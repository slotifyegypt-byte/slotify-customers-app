import { isAxiosError } from 'axios';

/**
 * customer-app-api-map.md §6: POST /bookings returns 409 (capacity slot full)
 * and 422 (validation errors) with a `{ detail: "..." }` body. Surface that
 * message verbatim when present, falling back to a generic string otherwise.
 */
export function getBookingErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.length > 0) {
      return detail;
    }
  }
  return fallback;
}

export function isCapacityConflict(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 409;
}
