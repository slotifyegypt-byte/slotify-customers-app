import { create, type AxiosRequestConfig } from 'axios';

import { appConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';

export const apiClient = create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// getSession() returns the stored session, refreshing it first if the access
// token has expired — so requests always carry a current token.
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 refresh: a single in-flight refresh call, everything else queues ──
// behind it and retries once it resolves. Supabase rotates refresh tokens,
// so two concurrent refreshes could revoke each other's session.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    // The session can't be recovered — sign out locally so the route guard
    // sends the user back to sign-in.
    await supabase.auth.signOut({ scope: 'local' });
    throw error ?? new Error('Session expired');
  }
  return data.session.access_token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });

    try {
      const newToken = await refreshPromise;
      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
      return apiClient(original);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
