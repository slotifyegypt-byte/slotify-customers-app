import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { unregisterPush } from '@/features/notifications/push';
import { useHiddenContentStore } from '@/features/support/store/hiddenContentStore';

import { useLogout } from './useLogout';

const mockSignOut = jest.fn();
const mockRemoveAllChannels = jest.fn();
const mockUnregisterPush = unregisterPush as jest.MockedFunction<typeof unregisterPush>;

jest.mock('@/features/notifications/push', () => ({ unregisterPush: jest.fn() }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { signOut: (...args: unknown[]) => mockSignOut(...args) },
    removeAllChannels: () => mockRemoveAllChannels(),
  },
}));

let queryClient: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  mockUnregisterPush.mockResolvedValue(undefined);
  mockSignOut.mockResolvedValue({ error: null });
  mockRemoveAllChannels.mockResolvedValue([]);
  queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
});

afterEach(() => queryClient.clear());

async function setup() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useLogout(), { wrapper });
}

describe('useLogout', () => {
  it('signs out, drops every realtime channel and clears the query cache', async () => {
    queryClient.setQueryData(['chat', 'messages', 'bk1'], [{ id: 'a' }]);
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRemoveAllChannels).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['chat', 'messages', 'bk1'])).toBeUndefined();
  });

  it('still drops channels and clears the cache when the server sign-out fails', async () => {
    mockSignOut
      .mockResolvedValueOnce({ error: new Error('offline') })
      .mockResolvedValueOnce({ error: null });
    queryClient.setQueryData(['x'], 1);
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).toHaveBeenLastCalledWith({ scope: 'local' });
    expect(mockRemoveAllChannels).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['x'])).toBeUndefined();
  });

  it("unregisters this device's push token before signing out, while the JWT is still valid", async () => {
    const order: string[] = [];
    mockUnregisterPush.mockImplementation(async () => {
      order.push('unregisterPush');
    });
    mockSignOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(order).toEqual(['unregisterPush', 'signOut']);
  });

  it('still signs out, drops channels and clears the cache when unregistering throws', async () => {
    mockUnregisterPush.mockRejectedValue(new Error('boom'));
    queryClient.setQueryData(['x'], 1);
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRemoveAllChannels).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['x'])).toBeUndefined();
  });

  it("forgets the signed-out customer's hidden reports", async () => {
    useHiddenContentStore.getState().hide('review', 'r-1');
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(useHiddenContentStore.getState().hidden).toEqual({});
  });
});
