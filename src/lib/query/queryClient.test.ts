import { ApiError } from '@/lib/api/errors';

import { queryClient, shouldRetry } from './queryClient';

describe('shouldRetry', () => {
  it('retries a network failure and a server error, twice at most', () => {
    expect(shouldRetry(0, new ApiError('network_error', 0))).toBe(true);
    expect(shouldRetry(1, new ApiError('internal_error', 500))).toBe(true);
    expect(shouldRetry(2, new ApiError('internal_error', 500))).toBe(false);
  });

  it('retries an unclassified error', () => {
    expect(shouldRetry(0, new Error('boom'))).toBe(true);
  });

  it('does not retry an answer that will not change', () => {
    for (const status of [400, 401, 403, 404, 409, 422]) {
      expect(shouldRetry(0, new ApiError('nope', status))).toBe(false);
    }
  });

  it('does retry "try again" answers: timeout and rate limit', () => {
    expect(shouldRetry(0, new ApiError('timeout', 408))).toBe(true);
    expect(shouldRetry(0, new ApiError('rate_limited', 429))).toBe(true);
  });
});

describe('queryClient defaults', () => {
  it('refreshes stale data on foreground and reconnect, and never retries a mutation', () => {
    const { queries, mutations } = queryClient.getDefaultOptions();
    expect(queries?.refetchOnWindowFocus).toBe(true);
    expect(queries?.refetchOnReconnect).toBe(true);
    expect(queries?.retry).toBe(shouldRetry);
    expect(mutations?.retry).toBe(0);
  });
});
