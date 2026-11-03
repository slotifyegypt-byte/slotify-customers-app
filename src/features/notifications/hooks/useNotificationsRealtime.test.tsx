import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { notificationKeys } from '../api/queryKeys';

import { useNotificationsRealtime } from './useNotificationsRealtime';

type ChangeHandler = (payload: { new: Record<string, unknown> }) => void;
interface FakeChannel {
  topic: string;
  on: jest.Mock;
  subscribe: jest.Mock;
  handler?: ChangeHandler;
  status?: (status: string) => void;
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
        subscribe: jest.fn((cb: (s: string) => void) => {
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
  useAuthStore: (select: (s: { accessToken: string | null }) => unknown) =>
    select({ accessToken: mockAccessToken }),
}));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  mockChannels.length = 0;
  mockRemoveChannel.mockReset();
  mockAccessToken = 'token';
  queryClient = new QueryClient();
});

describe('useNotificationsRealtime', () => {
  it('subscribes to inserts on notifications (RLS limits them to the caller)', async () => {
    await renderHook(() => useNotificationsRealtime(), { wrapper });

    expect(mockChannels).toHaveLength(1);
    expect(mockChannels[0].topic).toMatch(/^notifications-\d+$/);
    expect(mockChannels[0].on).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      expect.any(Function),
    );
    expect(mockChannels[0].subscribe).toHaveBeenCalled();
  });

  it('invalidates the list and the unread count on an insert', async () => {
    const spy = jest.spyOn(queryClient, 'invalidateQueries');
    await renderHook(() => useNotificationsRealtime(), { wrapper });

    await act(async () => mockChannels[0].handler?.({ new: { id: 'n1' } }));

    expect(spy).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  });

  it('refetches after a reconnect but not on the first SUBSCRIBED', async () => {
    const spy = jest.spyOn(queryClient, 'invalidateQueries');
    await renderHook(() => useNotificationsRealtime(), { wrapper });

    await act(async () => mockChannels[0].status?.('SUBSCRIBED'));
    expect(spy).not.toHaveBeenCalled();
    await act(async () => mockChannels[0].status?.('CLOSED'));
    await act(async () => mockChannels[0].status?.('SUBSCRIBED'));
    expect(spy).toHaveBeenCalledWith({ queryKey: notificationKeys.all });
  });

  it('removes the channel on unmount', async () => {
    const { unmount } = await renderHook(() => useNotificationsRealtime(), { wrapper });
    await unmount();
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannels[0]);
  });

  it('uses a fresh topic when re-subscribed', async () => {
    const first = await renderHook(() => useNotificationsRealtime(), { wrapper });
    await first.unmount();
    await renderHook(() => useNotificationsRealtime(), { wrapper });
    expect(mockChannels).toHaveLength(2);
    expect(mockChannels[0].topic).not.toBe(mockChannels[1].topic);
  });

  it('does not subscribe when signed out', async () => {
    mockAccessToken = null;
    await renderHook(() => useNotificationsRealtime(), { wrapper });
    expect(mockChannels).toHaveLength(0);
  });

  it('tears the channel down when the user signs out', async () => {
    const { rerender } = await renderHook(() => useNotificationsRealtime(), { wrapper });
    mockAccessToken = null;
    await rerender({});
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannels[0]);
    expect(mockChannels).toHaveLength(1);
  });
});
