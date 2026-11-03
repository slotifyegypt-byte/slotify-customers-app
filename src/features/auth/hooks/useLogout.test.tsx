import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useLogout } from './useLogout';

const mockSignOut = jest.fn();
const mockRemoveAllChannels = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { signOut: (...args: unknown[]) => mockSignOut(...args) },
    removeAllChannels: () => mockRemoveAllChannels(),
  },
}));

let queryClient: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
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
    mockSignOut.mockResolvedValueOnce({ error: new Error('offline') }).mockResolvedValueOnce({ error: null });
    queryClient.setQueryData(['x'], 1);
    const { result } = await setup();

    await act(async () => {
      await result.current();
    });

    expect(mockSignOut).toHaveBeenLastCalledWith({ scope: 'local' });
    expect(mockRemoveAllChannels).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['x'])).toBeUndefined();
  });
});
