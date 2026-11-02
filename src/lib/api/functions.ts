import { appConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';

import { ApiError, fromResponse } from './errors';

const functionUrl = (path: string) => `${appConfig.supabaseUrl}/functions/v1/${path}`;

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

  const res = await send(functionUrl(path), {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: appConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  return parse<T>(res);
}

// Public functions (availability) only need the publishable key.
export async function callPublicFunction<T>(
  path: string,
  query: Record<string, string>,
): Promise<T> {
  const res = await send(`${functionUrl(path)}?${new URLSearchParams(query).toString()}`, {
    headers: { apikey: appConfig.supabasePublishableKey },
  });
  return parse<T>(res);
}

// fetch only rejects on a network failure (offline, DNS, timeout) — surface
// it as an ApiError so callers handle one error type.
async function send(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError('network_error', 0);
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await fromResponse(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
