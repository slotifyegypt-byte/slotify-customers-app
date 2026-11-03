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
    // Leave every Realtime channel (chat) so a signed-out device stops
    // receiving the previous user's rows. Awaited, but never allowed to block
    // the cache clear: the local session is already gone at this point.
    await supabase.removeAllChannels().catch(() => undefined);
    queryClient.clear(); // drop every cached server response — next sign-in starts clean
  }, [queryClient]);
}
