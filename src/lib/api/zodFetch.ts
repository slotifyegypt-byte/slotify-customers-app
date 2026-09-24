import type { AxiosResponse } from 'axios';
import type { ZodType } from 'zod';

import { isDev } from '@/lib/config';
import { Sentry } from '@/lib/sentry';

/**
 * Validates an API response against the schema transcribed from the map doc.
 * A prior version of this app hand-wrote types that silently drifted from
 * the real backend contract, breaking nearly every screen — this makes that
 * drift loud instead of silent: it throws in dev (so it's caught the moment
 * it's introduced) and only logs in production (so a real user's session
 * isn't crashed by a minor field mismatch).
 */
export function validateResponse<T>(schema: ZodType<T>, response: AxiosResponse, context: string): T {
  const result = schema.safeParse(response.data);
  if (result.success) {
    return result.data;
  }

  const message = `[API contract drift] ${context}: ${result.error.message}`;
  if (isDev) {
    throw new Error(message);
  }
  Sentry.captureMessage(message, { level: 'warning', extra: { raw: response.data } });
  return response.data as T;
}
