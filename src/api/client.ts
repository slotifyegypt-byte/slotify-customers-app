import axios, { AxiosRequestConfig } from 'axios';
import { navigationRef } from '@/navigation/navigationRef';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 refresh logic ─────────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function drainQueue(token: string) {
  pendingQueue.forEach((p) => p.resolve(token));
  pendingQueue = [];
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach((p) => p.reject(err));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
            original._retry = true;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

    try {
      // Raw axios to avoid interceptor loop
      const { data } = await axios.post<{ access_token: string; refresh_token: string }>(
        `${BASE_URL}/customers/refresh`,
        { refresh_token: refreshToken },
      );

      setTokens(data.access_token, data.refresh_token);
      drainQueue(data.access_token);
      original.headers = { ...original.headers, Authorization: `Bearer ${data.access_token}` };
      return apiClient(original);
    } catch (refreshError) {
      rejectQueue(refreshError);
      clearAuth();
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'SignIn' }] });
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
