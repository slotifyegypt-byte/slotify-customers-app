import { notifyManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useEffect, type ReactNode } from 'react';

import { getBookingMessages, markBookingMessagesRead } from '../api/chatApi';
import type { BookingMessage } from '../api/schemas';

import { useBookingChat } from './useBookingChat';

type StatusCallback = (status: string) => void;
type ChangeHandler = (payload: { new: Record<string, unknown> }) => void;

interface FakeChannel {
  topic: string;
  on: jest.Mock;
  subscribe: jest.Mock;
  handler?: ChangeHandler;
  status?: StatusCallback;
}

const mockChannels: FakeChannel[] = [];
const mockRemoveChannel = jest.fn();
let mockAccessToken: string | null = 'token';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: (topic: string) => {
      const channel: FakeChannel = {
        topic,
        on: jest.fn((_type: string, _filter: unknown, handler: ChangeHandler) => {
          channel.handler = handler;
          return channel;
        }),
        subscribe: jest.fn((cb: StatusCallback) => {
          channel.status = cb;
          return channel;
        }),
      };
      mockChannels.push(channel);
      return channel;
    },
    removeChannel: (channel: FakeChannel) => mockRemoveChannel(channel),
  },
}));
jest.mock('@/features/auth/store/authStore', () => ({
  useAuthStore: (select: (s: { accessToken: string | null }) => unknown) => select({ accessToken: mockAccessToken }),
}));
jest.mock('../api/chatApi', () => ({
  ...jest.requireActual('../api/chatApi'),
  getBookingMessages: jest.fn(),
  sendBookingMessage: jest.fn(),
  markBookingMessagesRead: jest.fn(),
}));

const mockGetMessages = getBookingMessages as jest.MockedFunction<typeof getBookingMessages>;
const mockMarkRead = markBookingMessagesRead as jest.MockedFunction<typeof markBookingMessagesRead>;

notifyManager.setScheduler((callback) => callback());

const msg = (id: string, created_at: string): BookingMessage => ({
  id,
  booking_id: 'bk1',
  sender: 'branch',
  message: `message ${id}`,
  read_at: null,
  created_at,
});

const realtimeRow = (id: string, created_at: string) => ({
  id,
  booking_id: 'bk1',
  sender: 'branch',
  sender_customer_id: null,
  sender_employee_id: 'e1',
  body: `message ${id}`,
  read_at: null,
  created_at,
});

let queryClient: QueryClient;

async function setup(bookingId = 'bk1') {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(({ id }: { id: string }) => useBookingChat(id), { wrapper, initialProps: { id: bookingId } });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockChannels.length = 0;
  mockAccessToken = 'token';
  mockGetMessages.mockResolvedValue([msg('a', '2026-11-01T10:00:00Z')]);
  mockMarkRead.mockResolvedValue(undefined);
});

afterEach(() => {
  queryClient?.clear();
});

describe('useBookingChat', () => {
  it('subscribes to INSERTs on this booking with the exact filter', async () => {
    await setup();
    expect(mockChannels).toHaveLength(1);
    const [channel] = mockChannels;
    expect(channel.topic).toMatch(/^booking-bk1/);
    expect(channel.on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: 'booking_id=eq.bk1' },
      expect.any(Function),
    );
    expect(channel.subscribe).toHaveBeenCalledTimes(1);
  });

  it('reports isSocketConnected only while the channel is SUBSCRIBED', async () => {
    const { result } = await setup();
    expect(result.current.isSocketConnected).toBe(false);
    await act(async () => mockChannels[0].status?.('SUBSCRIBED'));
    expect(result.current.isSocketConnected).toBe(true);
    await act(async () => mockChannels[0].status?.('CHANNEL_ERROR'));
    expect(result.current.isSocketConnected).toBe(false);
  });

  it('merges a pushed row (mapped like a REST row) and ignores a duplicate', async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    await act(async () => mockChannels[0].handler?.({ new: realtimeRow('b', '2026-11-01T10:05:00Z') }));
    expect(result.current.messages.map((m) => m.id)).toEqual(['a', 'b']);
    expect(result.current.messages[1]).toEqual(msg('b', '2026-11-01T10:05:00Z'));

    await act(async () => mockChannels[0].handler?.({ new: realtimeRow('b', '2026-11-01T10:05:00Z') }));
    expect(result.current.messages).toHaveLength(2);
  });

  it('refetches to catch up on a SUBSCRIBED after the first one, not on the first', async () => {
    const { result } = await setup();
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    expect(mockGetMessages).toHaveBeenCalledTimes(1);

    await act(async () => mockChannels[0].status?.('SUBSCRIBED'));
    expect(mockGetMessages).toHaveBeenCalledTimes(1);

    await act(async () => mockChannels[0].status?.('CLOSED'));
    await act(async () => mockChannels[0].status?.('SUBSCRIBED'));
    await waitFor(() => expect(mockGetMessages).toHaveBeenCalledTimes(2));
  });

  it('removes the channel on unmount', async () => {
    const { unmount } = await setup();
    await unmount();
    expect(mockRemoveChannel).toHaveBeenCalledTimes(1);
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannels[0]);
  });

  it('swaps channels when the booking changes', async () => {
    const { rerender } = await setup('bk1');
    await rerender({ id: 'bk2' });
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannels[0]);
    expect(mockChannels).toHaveLength(2);
    expect(mockChannels[1].on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ filter: 'booking_id=eq.bk2' }),
      expect.any(Function),
    );
  });

  it('gives a re-mounted subscription its own topic (supabase-js reuses a channel that has the same topic)', async () => {
    const { rerender } = await setup('bk1');
    await rerender({ id: 'bk2' });
    await rerender({ id: 'bk1' });
    expect(new Set(mockChannels.map((c) => c.topic)).size).toBe(3);
  });

  it('does not subscribe while signed out', async () => {
    mockAccessToken = null;
    await setup();
    expect(mockChannels).toHaveLength(0);
  });

  describe('callback identity', () => {
    it('keeps markRead and sendMessage stable across re-renders', async () => {
      const { result, rerender } = await setup();
      const { markRead, sendMessage } = result.current;
      await rerender({ id: 'bk1' });
      await act(async () => result.current.markRead());
      await rerender({ id: 'bk1' });
      expect(result.current.markRead).toBe(markRead);
      expect(result.current.sendMessage).toBe(sendMessage);
    });

    it('marks read once per focus when markRead sits in an effect dependency list (as the screen does)', async () => {
      queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } },
      });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      await renderHook(
        () => {
          const chat = useBookingChat('bk1');
          const { markRead } = chat;
          useEffect(() => {
            markRead();
          }, [markRead]);
          return chat;
        },
        { wrapper },
      );
      // Let the mutation go pending -> success and re-render a few times.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      expect(mockMarkRead).toHaveBeenCalledTimes(1);
    });
  });
});
