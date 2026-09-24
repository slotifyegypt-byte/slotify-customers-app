import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';

import { logoutRemote } from '../api/authApi';

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await logoutRemote();
    clearAuth();
    queryClient.clear(); // drop every cached server response — next sign-in starts clean
  }, [clearAuth, queryClient]);
}
