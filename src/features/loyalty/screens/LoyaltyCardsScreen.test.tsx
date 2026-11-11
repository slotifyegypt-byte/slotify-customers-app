import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import { LoyaltyCardScreen } from './LoyaltyCardScreen';
import { LoyaltyCardsScreen } from './LoyaltyCardsScreen';

const mockPush = jest.fn();
const mockParams: { id?: string } = {};
const mockRpc = jest.fn();
const mockCallFunction = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...a: unknown[]) => mockPush(...a), back: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => mockRpc(...a) } }));
jest.mock('@/lib/api/functions', () => ({ callFunction: (...a: unknown[]) => mockCallFunction(...a) }));
jest.mock('@/lib/config', () => ({
  appConfig: { supabaseUrl: 'https://abc.supabase.co', supabasePublishableKey: 'k' },
  isDev: true,
}));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) => select({ preference: 'light' }),
}));

const raw = (over: Record<string, unknown> = {}) => ({
  card_id: 'c1',
  code: 'ABCDEFGHJK',
  business_id: 'b1',
  business_name: 'Glow Studio',
  logo_path: null,
  program_name: 'Glow Club',
  is_active: true,
  stamps: 3,
  stamps_required: 8,
  rewards_available: 0,
  rewards_redeemed: 0,
  reward_title: 'Free blow-dry',
  reward_description: 'Up to 60 minutes',
  brand_color: '#6A58D8',
  ...over,
});

const wrap = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </ThemeProvider>,
  );
};

beforeEach(() => {
  mockPush.mockReset();
  mockRpc.mockReset();
  mockCallFunction.mockReset().mockResolvedValue({ apple: false, google: false });
  delete mockParams.id;
});

describe('LoyaltyCardsScreen', () => {
  it('lists the cards and opens one', async () => {
    mockRpc.mockResolvedValue({ data: [raw(), raw({ card_id: 'c2', business_name: 'Zen Spa', code: 'ZZZZZZZZZZ' })], error: null });
    await wrap(<LoyaltyCardsScreen />);
    expect(await screen.findByText('Zen Spa')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: /Glow Studio loyalty card/ }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/(tabs)/profile/loyalty-card', params: { id: 'c1' } });
  });

  it('explains how to get a first card when there is none: scan the QR at the counter', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    await wrap(<LoyaltyCardsScreen />);
    expect(await screen.findByText('No loyalty cards yet')).toBeOnTheScreen();
    expect(screen.getByText(/Scan the QR code/)).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Add card' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile/loyalty-join');
  });

  it('offers Add card in the header once there are cards', async () => {
    mockRpc.mockResolvedValue({ data: [raw()], error: null });
    await wrap(<LoyaltyCardsScreen />);
    await screen.findByText('Glow Studio');
    await userEvent.setup().press(screen.getByRole('button', { name: 'Add card' }));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/profile/loyalty-join');
  });

  it('offers a retry when the cards cannot be loaded', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: 'PT500', message: 'boom', details: 'x' } });
    await wrap(<LoyaltyCardsScreen />);
    expect(await screen.findByText("We couldn't load your cards.")).toBeOnTheScreen();
    mockRpc.mockResolvedValue({ data: [raw()], error: null });
    await userEvent.setup().press(screen.getByText('Try again'));
    expect(await screen.findByText('Glow Studio')).toBeOnTheScreen();
  });
});

describe('LoyaltyCardScreen', () => {
  it('shows the card, the code to show at the counter and how it works', async () => {
    mockParams.id = 'c1';
    mockRpc.mockResolvedValue({ data: [raw({ rewards_available: 1, rewards_redeemed: 2 })], error: null });
    await wrap(<LoyaltyCardScreen />);
    expect(await screen.findByText('Show this code at the counter')).toBeOnTheScreen();
    expect(screen.getByText('ABCDE-FGHJK')).toBeOnTheScreen();
    expect(screen.getByLabelText('QR code for card ABCDE-FGHJK')).toBeOnTheScreen();
    expect(screen.getByText('Rewards ready: 1')).toBeOnTheScreen();
    expect(screen.getByText('Claimed so far: 2')).toBeOnTheScreen();
    expect(screen.getByText('You earn stamps on your visits. When the card is full you get Free blow-dry.')).toBeOnTheScreen();
    expect(screen.getByText('Up to 60 minutes')).toBeOnTheScreen();
  });

  it('says how many stamps are left to the reward when none is waiting', async () => {
    mockParams.id = 'c1';
    mockRpc.mockResolvedValue({ data: [raw()], error: null });
    await wrap(<LoyaltyCardScreen />);
    expect(await screen.findByText('Collect 5 stamps to get Free blow-dry')).toBeOnTheScreen();
  });

  it('tells the customer when the program is paused, and that nothing is lost', async () => {
    mockParams.id = 'c1';
    mockRpc.mockResolvedValue({ data: [raw({ is_active: false })], error: null });
    await wrap(<LoyaltyCardScreen />);
    expect(await screen.findByText('This program is paused. Your stamps and rewards are safe.')).toBeOnTheScreen();
  });

  it('handles a card that no longer exists', async () => {
    mockParams.id = 'gone';
    mockRpc.mockResolvedValue({ data: [raw()], error: null });
    await wrap(<LoyaltyCardScreen />);
    expect(await screen.findByText('Card not found')).toBeOnTheScreen();
  });

  it('shows no wallet section while the wallet is not set up', async () => {
    mockParams.id = 'c1';
    mockRpc.mockResolvedValue({ data: [raw()], error: null });
    await wrap(<LoyaltyCardScreen />);
    await screen.findByText('Show this code at the counter');
    await waitFor(() => expect(mockCallFunction).toHaveBeenCalledWith('wallet/capabilities'));
    expect(screen.queryByText('Keep it in your wallet')).not.toBeOnTheScreen();
  });
});
