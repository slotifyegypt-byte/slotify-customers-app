import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme';

import { SignInScreen } from './SignInScreen';

// `mock`-prefixed so jest's hoisting allows the factory to read it.
const mockConfig = { env: 'development' as 'development' | 'staging' | 'production' };

jest.mock('@/lib/config', () => ({
  appConfig: {
    get env() {
      return mockConfig.env;
    },
  },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: jest.fn() } },
}));
// The real store persists through expo-secure-store; the theme just needs to be 'light'.
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('expo-apple-authentication', () => ({
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationButtonType: { CONTINUE: 0 },
  AppleAuthenticationButtonStyle: { BLACK: 0, WHITE: 1 },
}));
jest.mock('../hooks/useOAuthSignIn', () => ({
  useOAuthSignIn: () => ({ signIn: jest.fn(), isLoading: false, error: null }),
}));
jest.mock('../hooks/useAppleSignIn', () => ({
  useAppleSignIn: () => ({ signIn: jest.fn(), isLoading: false, error: null }),
}));

const signInWithPassword = supabase.auth.signInWithPassword as jest.Mock;

const renderScreen = () =>
  render(
    <ThemeProvider>
      <SignInScreen />
    </ThemeProvider>,
  );

const globalWithDev = globalThis as { __DEV__?: boolean };
const originalDev = globalWithDev.__DEV__;

beforeEach(() => {
  signInWithPassword.mockReset();
});

afterEach(() => {
  globalWithDev.__DEV__ = originalDev;
});

describe('SignInScreen dev password sign-in', () => {
  it('is not rendered in a production build', async () => {
    globalWithDev.__DEV__ = false;
    mockConfig.env = 'production';
    await renderScreen();

    expect(screen.queryByPlaceholderText('Email')).toBeNull();
    expect(screen.queryByPlaceholderText('Password')).toBeNull();
    // The real sign-in options are still there.
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('is not rendered when APP_ENV is unset in a release bundle', async () => {
    // An OTA published without APP_ENV ships extra.appEnv='development'.
    globalWithDev.__DEV__ = false;
    mockConfig.env = 'development';
    await renderScreen();

    expect(screen.queryByPlaceholderText('Email')).toBeNull();
  });

  it('is rendered in a staging release build', async () => {
    globalWithDev.__DEV__ = false;
    mockConfig.env = 'staging';
    await renderScreen();

    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  it('signs in with email and password outside production', async () => {
    mockConfig.env = 'development';
    signInWithPassword.mockResolvedValue({ error: null });
    await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText('Email'), ' lina@slotify.dev ');
    await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    await fireEvent.press(screen.getByText('Sign in with password'));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'lina@slotify.dev',
        password: 'password123',
      }),
    );
  });

  it('shows the error when sign-in fails', async () => {
    mockConfig.env = 'staging';
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    await renderScreen();

    await fireEvent.changeText(screen.getByPlaceholderText('Email'), 'x@slotify.dev');
    await fireEvent.changeText(screen.getByPlaceholderText('Password'), 'nope');
    await fireEvent.press(screen.getByText('Sign in with password'));

    expect(await screen.findByText('Invalid login credentials')).toBeTruthy();
  });
});
