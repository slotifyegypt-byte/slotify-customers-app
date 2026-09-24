import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { appConfig } from '@/lib/config';

import {
  getBookingMessages,
  markBookingMessagesRead,
  sendBookingMessage,
} from '../api/chatApi';
import { chatKeys } from '../api/queryKeys';
import type { BookingMessage } from '../api/schemas';

const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1000;

/**
 * `appConfig.apiBaseUrl` is an http(s) URL (e.g.
 * "https://api.slotify-eg.com/api/v1"); the live-delivery socket in
 * customer-app-api-map.md §10 lives at the same host/path with the scheme
 * swapped to ws(s). Only the leading "http"/"https" is replaced so the rest
 * of the base URL (host, port, /api/v1 path) survives untouched.
 */
function buildSocketUrl(bookingId: string, token: string) {
  const wsBase = appConfig.apiBaseUrl.replace(/^http/, 'ws');
  return `${wsBase}/bookings/${bookingId}/messages/ws?token=${encodeURIComponent(token)}`;
}

function mergeMessage(prev: BookingMessage[] | undefined, incoming: BookingMessage): BookingMessage[] {
  if (!prev) return [incoming];
  // Dedupe by id — a message this client just sent via the REST POST can
  // also be pushed back over the socket (the doc confirms the socket
  // broadcasts every new message to all connected clients, sender included).
  if (prev.some((m) => m.id === incoming.id)) return prev;
  return [...prev, incoming];
}

/**
 * Owns everything for a single booking's chat thread per
 * customer-app-api-map.md §10: the REST message list (React Query), sending
 * (always REST — the socket is receive-only), and the live-delivery
 * WebSocket that pushes new messages from either side as they're posted.
 *
 * WebSocket lifecycle:
 * - One socket is opened per (bookingId, accessToken) via the effect below.
 * - On every open, pushed messages are parsed and merged into the same
 *   React Query cache entry the REST list uses, deduped by `id` so a
 *   message this client just sent doesn't render twice when it echoes back.
 * - If the socket closes for any reason other than our own cleanup, it
 *   reconnects with capped exponential backoff (1s, 2s, 4s, 8s, 16s, then
 *   30s repeating). The backend has no cross-instance fan-out (documented
 *   in §10), so anything broadcast while disconnected is simply lost —
 *   every reconnect (but not the very first connect, which would just
 *   duplicate the mount-time REST fetch) invalidates the REST query to
 *   catch up instead of trying to replay missed pushes.
 * - Cleanup (unmount, or bookingId/token changing) sets a guard flag first,
 *   clears any pending reconnect timer, detaches all socket handlers
 *   (important: `onclose` is nulled out *before* calling `close()`, so the
 *   close this cleanup itself triggers can never schedule a reconnect after
 *   the component is gone), then closes the socket. Without the guard flag
 *   + handler detachment a fast unmount/remount (e.g. navigating away and
 *   back quickly) could otherwise leave a stray socket + reconnect timer
 *   running forever in the background.
 */
export function useBookingChat(bookingId: string) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const messagesQuery = useQuery({
    queryKey: chatKeys.messages(bookingId),
    queryFn: () => getBookingMessages(bookingId),
    enabled: Boolean(bookingId),
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendBookingMessage(bookingId, message),
    onSuccess: (sent) => {
      queryClient.setQueryData<BookingMessage[]>(chatKeys.messages(bookingId), (prev) => mergeMessage(prev, sent));
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => markBookingMessagesRead(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount(bookingId) }),
  });

  // Refs (not state) for everything the reconnect loop touches — none of it
  // should trigger a re-render, and the effect closure below must always
  // see live values without needing to be re-created on every change.
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);
  const hasConnectedBeforeRef = useRef(false);
  const cleanedUpRef = useRef(false);

  useEffect(() => {
    if (!bookingId || !token) {
      return undefined;
    }

    cleanedUpRef.current = false;
    hasConnectedBeforeRef.current = false;
    attemptRef.current = 0;

    const connect = () => {
      if (cleanedUpRef.current) return;

      const socket = new WebSocket(buildSocketUrl(bookingId, token));
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
        setIsSocketConnected(true);
        if (hasConnectedBeforeRef.current) {
          // Reconnecting after a drop: the backend can't replay what it
          // broadcast while we were away, so re-fetch history instead.
          queryClient.invalidateQueries({ queryKey: chatKeys.messages(bookingId) });
        }
        hasConnectedBeforeRef.current = true;
      };

      socket.onmessage = (event) => {
        let incoming: BookingMessage;
        try {
          incoming = JSON.parse(event.data);
        } catch {
          return; // unrecognized payload — ignore rather than crash the thread
        }
        queryClient.setQueryData<BookingMessage[]>(chatKeys.messages(bookingId), (prev) => mergeMessage(prev, incoming));
      };

      socket.onclose = () => {
        socketRef.current = null;
        setIsSocketConnected(false);
        if (cleanedUpRef.current) return;
        const delay = Math.min(BASE_BACKOFF_MS * 2 ** attemptRef.current, MAX_BACKOFF_MS);
        attemptRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      // onerror is always followed by onclose for WebSocket, so reconnect
      // scheduling lives solely in onclose to avoid double-scheduling.
      socket.onerror = () => {};
    };

    connect();

    return () => {
      cleanedUpRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      const socket = socketRef.current;
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null; // detach first so this close() can't trigger a reconnect
        socket.close();
        socketRef.current = null;
      }
      setIsSocketConnected(false);
    };
  }, [bookingId, token, queryClient]);

  const sendMessage = useCallback(
    (message: string) => sendMutation.mutateAsync(message),
    [sendMutation],
  );

  const markRead = useCallback(() => markReadMutation.mutate(), [markReadMutation]);

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
