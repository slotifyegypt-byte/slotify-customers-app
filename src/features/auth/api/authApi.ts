import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { tokenResponseSchema, type TokenResponse } from './schemas';

// customer-app-api-map.md §1
export async function exchangeGoogleCode(code: string): Promise<TokenResponse> {
  const response = await apiClient.post('/customers/auth/google/exchange', { code });
  return validateResponse(tokenResponseSchema, response, 'POST /customers/auth/google/exchange');
}

export async function refreshTokens(refresh_token: string): Promise<TokenResponse> {
  const response = await apiClient.post('/customers/refresh', { refresh_token });
  return validateResponse(tokenResponseSchema, response, 'POST /customers/refresh');
}

// §11 — "client-side token discard only, no server-side session invalidation"
// per the map doc. We still call it (harmless, and covers the day the
// backend adds real invalidation) but never let its failure block sign-out.
export async function logoutRemote(): Promise<void> {
  await apiClient.post('/customers/logout').catch(() => undefined);
}
