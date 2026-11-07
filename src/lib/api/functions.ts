import { appConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';

import { ApiError, fromResponse } from './errors';

const functionUrl = (path: string) => `${appConfig.supabaseUrl}/functions/v1/${path}`;

// A request that never answers (a stalled connection that is neither up nor down) would leave a spinner on screen
// forever, so give up after a while and report it like any other network failure. Reads give up quickly: nothing is
// lost by asking again. A write (booking, reschedule, delete) gets much longer, because abandoning one the server is
// still working on can leave the customer unsure whether it happened, and retrying it could double-book.
const READ_TIMEOUT_MS = 20_000;
const WRITE_TIMEOUT_MS = 60_000;

interface CallInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

// Signed-in Edge Functions (developer-guide.md §6) need the user's access
// token *and* the publishable key. getSession() returns the stored session,
// refreshing it first if the access token has expired — supabase-js owns
// refresh, so there's no 401-retry layer here.
export async function callFunction<T>(path: string, init: CallInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new ApiError('not_signed_in', 401);

  const method = init.method ?? 'GET';
  return request<T>(
    functionUrl(path),
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: appConfig.supabasePublishableKey,
        'Content-Type': 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    },
    method === 'GET' ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS,
  );
}

// Public functions (availability) only need the publishable key.
export async function callPublicFunction<T>(
  path: string,
  query: Record<string, string>,
): Promise<T> {
  return request<T>(
    `${functionUrl(path)}?${new URLSearchParams(query).toString()}`,
    { headers: { apikey: appConfig.supabasePublishableKey } },
    READ_TIMEOUT_MS,
  );
}

// fetch only rejects on a network failure (offline, DNS, timeout) — surface
// it as an ApiError so callers handle one error type.
// The timer covers the whole exchange, headers and body, so a response that starts and then stalls cannot hang.
async function request<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return await parse<T>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('network_error', 0);
  } finally {
    clearTimeout(timer);
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await fromResponse(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
