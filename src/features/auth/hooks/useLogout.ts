import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { unregisterPush } from '@/features/notifications/push';
import { supabase } from '@/lib/supabase';

export function useLogout() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    // Remove this device's push token first: it needs the still-valid session,
    // and a signed-out device must not keep receiving this user's pushes.
    // Best-effort and time-boxed, so it can never block the sign-out.
    await unregisterPush().catch(() => undefined);
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
