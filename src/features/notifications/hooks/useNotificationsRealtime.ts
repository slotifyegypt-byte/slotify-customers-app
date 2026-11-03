import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { supabase } from '@/lib/supabase';

import { notificationKeys } from '../api/queryKeys';

// realtime-js hands back the existing channel for a topic until the server
// acks its leave, so a re-created subscription (strict mode, sign-out/in) gets
// a unique topic — same reasoning as useBookingChat.
let subscriptionSeq = 0;

/**
 * Keeps the notification list and the unread badge live (developer-guide.md §7).
 * `notifications` is in the Realtime publication and RLS only delivers the
 * caller's own rows, so the INSERT subscription needs no filter. Rows are not
 * merged into the cache: the payload carries no server-side defaults worth
 * trusting, and a refetch of two cheap queries keeps one source of truth.
 *
 * Mount once, signed in. Every SUBSCRIBED after the first refetches, because
 * inserts made while the socket was down are not replayed.
 */
export function useNotificationsRealtime(): void {
  const queryClient = useQueryClient();
  const isSignedIn = useAuthStore((s) => Boolean(s.accessToken));

  useEffect(() => {
    if (!isSignedIn) return undefined;

    let hasSubscribed = false;
    subscriptionSeq += 1;
    const channel = supabase
      .channel(`notifications-${subscriptionSeq}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        if (hasSubscribed) queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        hasSubscribed = true;
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isSignedIn, queryClient]);
}
