import type { ZodType } from 'zod';

import { isDev } from '@/lib/config';
import { Sentry } from '@/lib/sentry';

/**
 * Validates an Edge Function JSON body against the schema transcribed from
 * the backend. Drift is loud in dev (throws the moment it's introduced) and
 * quiet in production (reported to Sentry, raw data passed through) so a
 * minor field mismatch never crashes a real customer's session.
 */
export function parseOrReport<T>(schema: ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const message = `[API contract drift] ${context}: ${result.error.message}`;
  if (isDev) {
    throw new Error(message);
  }
  Sentry.captureMessage(message, { level: 'warning', extra: { raw: data } });
  return data as T;
}
