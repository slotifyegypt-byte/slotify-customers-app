import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { supabase } from '@/lib/supabase';

import {
  getBookingMessages,
  markBookingMessagesRead,
  sendBookingMessage,
  toBookingMessage,
  type MessageRow,
} from '../api/chatApi';
import { chatKeys } from '../api/queryKeys';
import type { BookingMessage } from '../api/schemas';

import { mergeMessage } from './mergeMessage';

// supabase-js hands back the existing channel when asked for a topic it still
// holds, and a channel only leaves that list once the server acknowledges the
// leave. A subscription re-created right after cleanup (React strict mode's
// double effect, or leaving and re-opening a chat) would therefore get the
// closing channel back and `.on()` would throw. A per-subscription suffix
// keeps every subscription on a channel of its own.
let subscriptionSeq = 0;

/**
 * Owns everything for a single booking's chat thread (developer-guide.md §7):
 * the REST message list (React Query), sending (always an insert — Realtime is
 * receive-only), and a Realtime `postgres_changes` subscription that pushes new
 * messages from either side as they're inserted.
 *
 * - New rows are mapped like REST rows and merged into the same query cache,
 *   deduped by `id`, so a message this client just sent doesn't render twice
 *   when it echoes back.
 * - supabase-js rejoins a dropped channel by itself. Anything inserted while
 *   disconnected is not replayed, so every SUBSCRIBED after the first one
 *   (not the first, which would only repeat the mount-time fetch) refetches.
 * - Cleanup removes the channel. Realtime follows the auth session on its own,
 *   so the access token only decides whether to subscribe at all.
 */
export function useBookingChat(bookingId: string) {
  const queryClient = useQueryClient();
  const isSignedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const messagesQuery = useQuery({
    queryKey: chatKeys.messages(bookingId),
    queryFn: () => getBookingMessages(bookingId),
    enabled: Boolean(bookingId),
  });

  // `useMutation` returns a new result object on every render, but `mutate` /
  // `mutateAsync` are stable. The callbacks below depend on those, never on the
  // result object, so the screen can put them in effect dependency lists
  // without re-firing on every state change.
  const sendMutation = useMutation({
    mutationFn: (message: string) => sendBookingMessage(bookingId, message),
    onSuccess: (sent) => {
      queryClient.setQueryData<BookingMessage[]>(chatKeys.messages(bookingId), (prev) => mergeMessage(prev, sent));
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => markBookingMessagesRead(bookingId),
  });
  const { mutate: markReadMutate } = markReadMutation;
  const { mutateAsync: sendMutateAsync } = sendMutation;

  useEffect(() => {
    if (!bookingId || !isSignedIn) return undefined;

    let hasSubscribed = false;
    subscriptionSeq += 1;
    const channel = supabase
      .channel(`booking-${bookingId}-${subscriptionSeq}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          const incoming = toBookingMessage(payload.new as MessageRow);
          queryClient.setQueryData<BookingMessage[]>(chatKeys.messages(bookingId), (prev) =>
            mergeMessage(prev, incoming),
          );
        },
      )
      .subscribe((status) => {
        setIsSocketConnected(status === 'SUBSCRIBED');
        if (status !== 'SUBSCRIBED') return;
        if (hasSubscribed) {
          queryClient.invalidateQueries({ queryKey: chatKeys.messages(bookingId) });
        }
        hasSubscribed = true;
      });

    return () => {
      setIsSocketConnected(false);
      void supabase.removeChannel(channel);
    };
  }, [bookingId, isSignedIn, queryClient]);

  const sendMessage = useCallback((message: string) => sendMutateAsync(message), [sendMutateAsync]);

  const markRead = useCallback(() => markReadMutate(), [markReadMutate]);

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    refetch: messagesQuery.refetch,
    isSocketConnected,
    sendMessage,
    isSending: sendMutation.isPending,
    sendError: sendMutation.error,
    markRead,
  };
}
