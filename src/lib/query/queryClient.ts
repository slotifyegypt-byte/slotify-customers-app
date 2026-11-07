import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@/lib/api/errors';

const MAX_RETRIES = 2;

/**
 * Retry only what can plausibly succeed on a second try: network drops, timeouts and 5xx. A 4xx (not found,
 * forbidden, validation, rate limit) answers the same way every time, so retrying only delays the error screen —
 * except 408 and 429, which are explicitly "try again".
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (isApiError(error) && error.status >= 400 && error.status < 500) {
    return error.status === 408 || error.status === 429;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      // Refetch stale data when the app returns to the foreground or the network comes back; both signals are
      // wired in `lib/query/managers.ts` (React Native has no window focus event of its own).
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
