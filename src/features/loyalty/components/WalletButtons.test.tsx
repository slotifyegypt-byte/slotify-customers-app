import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

import '@/lib/i18n';
import { ApiError } from '@/lib/api/errors';
import { ThemeProvider } from '@/theme';

import type { LoyaltyCard } from '../api/schemas';

import { WalletButtons } from './WalletButtons';

const mockCallFunction = jest.fn();
jest.mock('@/lib/api/functions', () => ({ callFunction: (...args: unknown[]) => mockCallFunction(...args) }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/config', () => ({
  appConfig: { supabaseUrl: 'https://abc.supabase.co', supabasePublishableKey: 'k' },
  isDev: true,
}));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) => select({ preference: 'light' }),
}));

const CARD: LoyaltyCard = {
  id: 'c1', code: 'ABCDEFGHJK', businessId: 'b1', businessName: 'Glow Studio', logoPath: null, programName: 'Glow Club',
  isActive: true, stamps: 3, stampsRequired: 8, rewardsAvailable: 0, rewardsRedeemed: 0, rewardTitle: 'Free blow-dry',
  rewardDescription: null, brandColor: '#6A58D8',
};

function setPlatform(os: 'ios' | 'android') {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

async function view(caps: { apple: boolean; google: boolean } | 'error') {
  mockCallFunction.mockImplementation(async (path: string) => {
    if (path === 'wallet/capabilities') {
      if (caps === 'error') throw new Error('offline');
      return caps;
    }
    if (path === 'wallet/google/save-link') return { url: 'https://pay.google.com/gp/v/save/abc.def.ghi' };
    if (path === 'wallet/apple/link') return { url: 'https://abc.supabase.co/functions/v1/wallet/apple/download/c1?exp=1&sig=ab' };
    throw new Error(`unexpected ${path}`);
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <WalletButtons card={CARD} />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

let openURL: jest.SpyInstance;
beforeEach(() => {
  mockCallFunction.mockReset();
  openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});
afterEach(() => openURL.mockRestore());

describe('WalletButtons', () => {
  it('on an iPhone offers Apple Wallet only, and opens the pass link', async () => {
    setPlatform('ios');
    await view({ apple: true, google: true });
    const button = await screen.findByRole('button', { name: 'Add to Apple Wallet' });
    expect(screen.queryByRole('button', { name: 'Add to Google Wallet' })).not.toBeOnTheScreen();
    await userEvent.setup().press(button);
    await waitFor(() => expect(openURL).toHaveBeenCalledWith('https://abc.supabase.co/functions/v1/wallet/apple/download/c1?exp=1&sig=ab'));
    expect(mockCallFunction).toHaveBeenCalledWith('wallet/apple/link', { method: 'POST', body: { card_id: 'c1' } });
  });

  it('on Android offers Google Wallet only, and opens the save link', async () => {
    setPlatform('android');
    await view({ apple: true, google: true });
    const button = await screen.findByRole('button', { name: 'Add to Google Wallet' });
    expect(screen.queryByRole('button', { name: 'Add to Apple Wallet' })).not.toBeOnTheScreen();
    await userEvent.setup().press(button);
    await waitFor(() => expect(openURL).toHaveBeenCalledWith('https://pay.google.com/gp/v/save/abc.def.ghi'));
  });

  it('shows nothing when the wallet is not set up yet', async () => {
    setPlatform('ios');
    await view({ apple: false, google: false });
    await waitFor(() => expect(mockCallFunction).toHaveBeenCalledWith('wallet/capabilities'));
    expect(screen.queryByText('Keep it in your wallet')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('shows nothing when the platform cannot be reached', async () => {
    setPlatform('ios');
    await view('error');
    await waitFor(() => expect(mockCallFunction).toHaveBeenCalledWith('wallet/capabilities'));
    expect(screen.queryByText('Keep it in your wallet')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('says so, in words, when the link cannot be opened', async () => {
    setPlatform('android');
    await view({ apple: false, google: true });
    mockCallFunction.mockImplementation(async (path: string) => {
      if (path === 'wallet/capabilities') return { apple: false, google: true };
      throw new ApiError('wallet_not_configured', 503);
    });
    await userEvent.setup().press(await screen.findByRole('button', { name: 'Add to Google Wallet' }));
    expect(await screen.findByText("We couldn't open your wallet. Please try again.")).toBeOnTheScreen();
    expect(openURL).not.toHaveBeenCalled();
  });

  it('never opens a link that points somewhere unexpected', async () => {
    setPlatform('android');
    await view({ apple: false, google: true });
    mockCallFunction.mockImplementation(async (path: string) =>
      path === 'wallet/capabilities' ? { apple: false, google: true } : { url: 'https://evil.test/gp/v/save/x' },
    );
    await userEvent.setup().press(await screen.findByRole('button', { name: 'Add to Google Wallet' }));
    expect(await screen.findByText("We couldn't open your wallet. Please try again.")).toBeOnTheScreen();
    expect(openURL).not.toHaveBeenCalled();
  });
});
