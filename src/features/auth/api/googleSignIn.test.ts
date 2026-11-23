import { Platform } from 'react-native';

const mockConfig = { googleWebClientId: 'web-id', googleIosClientId: 'ios-id' };
const mockSignInWithIdToken = jest.fn();
const mockSignInWithBrowser = jest.fn();
const mockGoogle = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('@/lib/config', () => ({ appConfig: mockConfig }));
jest.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithIdToken: (...args: unknown[]) => mockSignInWithIdToken(...args) } },
}));
jest.mock('./oauth', () => ({ signInWithBrowser: (...args: unknown[]) => mockSignInWithBrowser(...args) }));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: mockGoogle,
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED', IN_PROGRESS: 'IN_PROGRESS' },
  isErrorWithCode: (e: unknown) => typeof (e as { code?: unknown })?.code === 'string',
  isSuccessResponse: (r: { type: string }) => r.type === 'success',
}));

// The module caches the loaded library, so each test gets a fresh copy.
function load(): typeof import('./googleSignIn') {
  let mod!: typeof import('./googleSignIn');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('./googleSignIn');
  });
  return mod;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockConfig.googleWebClientId = 'web-id';
  mockConfig.googleIosClientId = 'ios-id';
  Platform.OS = 'ios';
  mockGoogle.hasPlayServices.mockResolvedValue(true);
  mockGoogle.signOut.mockResolvedValue(null);
  mockSignInWithIdToken.mockResolvedValue({ error: null });
  mockSignInWithBrowser.mockResolvedValue(true);
});

describe('signInWithGoogle', () => {
  it('hands the Google ID token to Supabase', async () => {
    mockGoogle.signIn.mockResolvedValue({ type: 'success', data: { idToken: 'token-123' } });

    await expect(load().signInWithGoogle()).resolves.toBe(true);

    expect(mockGoogle.configure).toHaveBeenCalledWith({ webClientId: 'web-id', iosClientId: 'ios-id' });
    expect(mockSignInWithIdToken).toHaveBeenCalledWith({ provider: 'google', token: 'token-123' });
    expect(mockSignInWithBrowser).not.toHaveBeenCalled();
  });

  it('resolves false when the customer closes the Google sheet', async () => {
    mockGoogle.signIn.mockResolvedValue({ type: 'cancelled', data: null });

    await expect(load().signInWithGoogle()).resolves.toBe(false);
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });

  it('treats the cancelled error code as backing out, not a failure', async () => {
    mockGoogle.signIn.mockRejectedValue(Object.assign(new Error('cancelled'), { code: 'SIGN_IN_CANCELLED' }));

    await expect(load().signInWithGoogle()).resolves.toBe(false);
  });

  it('passes on a Supabase error', async () => {
    mockGoogle.signIn.mockResolvedValue({ type: 'success', data: { idToken: 'token-123' } });
    mockSignInWithIdToken.mockResolvedValue({ error: new Error('Unacceptable audience in id_token') });

    await expect(load().signInWithGoogle()).rejects.toThrow('Unacceptable audience');
  });

  it('uses the browser flow when the web client ID is not set', async () => {
    mockConfig.googleWebClientId = '';

    await expect(load().signInWithGoogle()).resolves.toBe(true);
    expect(mockSignInWithBrowser).toHaveBeenCalledWith('google');
    expect(mockGoogle.signIn).not.toHaveBeenCalled();
  });

  it('uses the browser flow on iOS when the iOS client ID is not set', async () => {
    mockConfig.googleIosClientId = '';

    await load().signInWithGoogle();
    expect(mockSignInWithBrowser).toHaveBeenCalledWith('google');
  });

  it('needs only the web client ID on Android', async () => {
    Platform.OS = 'android';
    mockConfig.googleIosClientId = '';
    mockGoogle.signIn.mockResolvedValue({ type: 'success', data: { idToken: 'token-123' } });

    await expect(load().signInWithGoogle()).resolves.toBe(true);
    expect(mockSignInWithBrowser).not.toHaveBeenCalled();
  });
});

describe('signOutOfGoogle', () => {
  it('forgets the Google account on this phone', async () => {
    await load().signOutOfGoogle();
    expect(mockGoogle.signOut).toHaveBeenCalled();
  });

  it('does nothing when native Google sign-in is not set up', async () => {
    mockConfig.googleWebClientId = '';
    await load().signOutOfGoogle();
    expect(mockGoogle.signOut).not.toHaveBeenCalled();
  });
});
