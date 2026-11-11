import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import { LoyaltyJoinScreen } from './LoyaltyJoinScreen';

const mockReplace = jest.fn();
const mockParams: { code?: string } = {};
const mockRpc = jest.fn();
let mockScanned = '';

jest.mock('expo-router', () => ({
  router: { replace: (...a: unknown[]) => mockReplace(...a), back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...a: unknown[]) => mockRpc(...a) } }));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) => select({ preference: 'light' }),
}));
// A stand-in camera: pressing it "scans" whatever mockScanned holds.
jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factories cannot use imports
  const { Pressable, Text } = require('react-native');
  return {
    useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn()],
    CameraView: ({ onBarcodeScanned }: { onBarcodeScanned: (r: { data: string }) => void }) => (
      <Pressable accessibilityLabel="camera" onPress={() => onBarcodeScanned({ data: mockScanned })}>
        <Text>camera</Text>
      </Pressable>
    ),
  };
});

const CARD = {
  card_id: 'c1',
  code: 'QQQQQQQQQQ',
  business_id: 'b1',
  business_name: 'Glow Studio',
  logo_path: null,
  program_name: 'Glow Club',
  is_active: true,
  stamps: 0,
  stamps_required: 8,
  rewards_available: 0,
  rewards_redeemed: 0,
  reward_title: 'Free blow-dry',
  reward_description: null,
  brand_color: '#6A58D8',
};

const wrap = (ui: React.ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </ThemeProvider>,
  );
};

beforeEach(() => {
  mockReplace.mockReset();
  mockRpc.mockReset();
  mockScanned = '';
  delete mockParams.code;
});

describe('LoyaltyJoinScreen', () => {
  it('scanning a business QR adds the card and opens it, even with 0 stamps', async () => {
    mockRpc.mockResolvedValue({ data: CARD, error: null });
    mockScanned = 'slotify://loyalty/join/ABCDEFGHJK';
    await wrap(<LoyaltyJoinScreen />);
    await userEvent.setup().press(await screen.findByLabelText('camera'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({ pathname: '/(tabs)/profile/loyalty-card', params: { id: 'c1' } }));
    expect(mockRpc).toHaveBeenCalledWith('join_loyalty_program', { p_join_code: 'ABCDEFGHJK' });
  });

  it('ignores a QR code that is not a loyalty QR, without bothering the server', async () => {
    mockScanned = 'https://example.com/menu';
    await wrap(<LoyaltyJoinScreen />);
    await userEvent.setup().press(await screen.findByLabelText('camera'));
    expect(mockRpc).not.toHaveBeenCalled();
    expect(await screen.findByText("That doesn't look like a loyalty QR code.")).toBeOnTheScreen();
  });

  it('lets the customer type the code instead', async () => {
    mockRpc.mockResolvedValue({ data: CARD, error: null });
    await wrap(<LoyaltyJoinScreen />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Join code'), 'abcde-fghjk');
    await user.press(screen.getByRole('button', { name: 'Add card' }));
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('join_loyalty_program', { p_join_code: 'ABCDEFGHJK' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  });

  it('says so when the typed code is not a code', async () => {
    await wrap(<LoyaltyJoinScreen />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Join code'), 'nope');
    await user.press(screen.getByRole('button', { name: 'Add card' }));
    expect(await screen.findByText("That doesn't look like a loyalty QR code.")).toBeOnTheScreen();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('explains an unknown code and a paused program in words', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    await wrap(<LoyaltyJoinScreen />);
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText('Join code'), 'ABCDEFGHJK');
    await user.press(screen.getByRole('button', { name: 'Add card' }));
    expect(await screen.findByText(/couldn't find a loyalty program for this code/)).toBeOnTheScreen();
    mockRpc.mockResolvedValueOnce({ data: null, error: { code: 'PT409', message: 'program_inactive', details: 'x' } });
    await user.press(screen.getByRole('button', { name: 'Add card' }));
    expect(await screen.findByText('This loyalty program is paused right now.')).toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('joins straight away when opened from a slotify:// link with the code', async () => {
    mockRpc.mockResolvedValue({ data: CARD, error: null });
    mockParams.code = 'ABCDEFGHJK';
    await wrap(<LoyaltyJoinScreen />);
    await waitFor(() => expect(mockRpc).toHaveBeenCalledWith('join_loyalty_program', { p_join_code: 'ABCDEFGHJK' }));
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  });
});
