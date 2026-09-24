import axios, { create, type AxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/features/auth/store/authStore';
import { appConfig } from '@/lib/config';

export const apiClient = create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 refresh: a single in-flight refresh call, everything else queues ──
// behind it and retries once it resolves. This is the mutex — two 401s
// arriving together must never trigger two refresh calls.
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
  if (!refreshToken) {
    clearAuth();
    throw new Error('No refresh token available');
  }
  try {
    const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
      `${appConfig.apiBaseUrl}/customers/refresh`,
      { refresh_token: refreshToken },
    );
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch (err) {
    clearAuth();
    throw err;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};

    if (error.response?.status !== 401 || original._retry || !useAuthStore.getState().refreshToken) {
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
