import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import { BlockedScreen } from './BlockedScreen';

jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

const BLOCKS = [
  {
    block_id: 'b1',
    kind: 'business',
    name: 'Glamour Studio',
    created_at: '2026-11-22T10:00:00Z',
    branch_ids: ['br1'],
  },
  {
    block_id: 'b2',
    kind: 'person',
    name: 'Karim',
    created_at: '2026-11-21T10:00:00Z',
    branch_ids: [],
  },
];

let client: QueryClient;
const renderScreen = () => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <BlockedScreen />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  client.clear();
  mockRpc.mockReset();
});

describe('BlockedScreen', () => {
  it('lists blocked businesses and people, and unblocks one', async () => {
    mockRpc.mockImplementation(async (name: string) =>
      name === 'get_my_blocks' ? { data: BLOCKS, error: null } : { data: null, error: null },
    );
    await renderScreen();
    expect(await screen.findByText('Glamour Studio')).toBeTruthy();
    expect(screen.getByText('Business')).toBeTruthy();
    expect(screen.getByText('Karim')).toBeTruthy();
    expect(screen.getByText('Reviewer')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Unblock Karim' }));
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('unblock', { p_block_id: 'b2' }));
  });

  it('says so when nobody is blocked', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    await renderScreen();
    expect(await screen.findByText('Nobody is blocked')).toBeTruthy();
  });
});
