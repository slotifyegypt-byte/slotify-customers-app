import { render, screen, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import { exchangeCode } from '../api/oauth';

import { AuthCallbackScreen } from './AuthCallbackScreen';

const mockParams: { code?: string; error?: string; error_description?: string } = {};
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));
jest.mock('../api/oauth', () => ({ exchangeCode: jest.fn() }));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));

const renderScreen = () =>
  render(
    <ThemeProvider>
      <AuthCallbackScreen />
    </ThemeProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(mockParams)) delete mockParams[key as keyof typeof mockParams];
});

describe('AuthCallbackScreen', () => {
  it('never prints text that arrived in the link', async () => {
    // Anyone can open slotify://auth/callback?error_description=... and put words on this screen.
    mockParams.error = 'access_denied';
    mockParams.error_description = 'Your account is locked. Call 0100-000-0000 to unlock it.';
    await renderScreen();

    expect(screen.queryByText(/account is locked/)).not.toBeOnTheScreen();
    expect(screen.queryByText(/0100/)).not.toBeOnTheScreen();
    expect(screen.getByText('Sign-in failed')).toBeOnTheScreen();
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  it('exchanges the code once and goes home', async () => {
    mockParams.code = 'abc';
    (exchangeCode as jest.Mock).mockResolvedValue(undefined);
    await renderScreen();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(exchangeCode).toHaveBeenCalledTimes(1);
    expect(exchangeCode).toHaveBeenCalledWith('abc');
  });

  it('shows a generic message, not the server error, when the exchange fails', async () => {
    mockParams.code = 'abc';
    (exchangeCode as jest.Mock).mockRejectedValue(new Error('invalid flow state, internal detail'));
    await renderScreen();

    await waitFor(() => expect(screen.getByText('Sign-in failed')).toBeOnTheScreen());
    expect(screen.queryByText(/internal detail/)).not.toBeOnTheScreen();
    expect(mockReplace).not.toHaveBeenCalledWith('/');
  });
});
