import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';

export function useLogout() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Revokes the refresh token server-side. If that fails (offline, or the
    // account was just deleted) still clear the local session.
    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: 'local' });
    queryClient.clear(); // drop every cached server response — next sign-in starts clean
  }, [queryClient]);
}
