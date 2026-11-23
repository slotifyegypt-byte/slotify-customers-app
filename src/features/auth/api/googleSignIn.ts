import { Platform } from 'react-native';

import { appConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';

import { signInWithBrowser } from './oauth';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

let loaded: GoogleSignInModule | null | undefined;

/**
 * The native Google sign-in module, configured, or null when it can't be used: on the web, when the
 * client IDs aren't set for this build, or in an app binary built before the library was added
 * (loading it there throws because the native side is missing). Required lazily for that last case,
 * so an over-the-air update never crashes an older binary.
 */
function loadNativeGoogle(): GoogleSignInModule | null {
  const { googleWebClientId, googleIosClientId } = appConfig;
  if (Platform.OS === 'web' || !googleWebClientId) return null;
  if (Platform.OS === 'ios' && !googleIosClientId) return null;

  if (loaded === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod: GoogleSignInModule = require('@react-native-google-signin/google-signin');
      mod.GoogleSignin.configure({
        // The ID token is issued for the web client, which is the one listed in Supabase's Google provider.
        webClientId: googleWebClientId,
        iosClientId: googleIosClientId || undefined,
      });
      loaded = mod;
    } catch {
      loaded = null;
    }
  }
  return loaded;
}

/**
 * Google's own sign-in sheet (it names Slotify, not the Supabase domain), whose ID token is handed to
 * Supabase. Falls back to Supabase's browser flow when the native module can't be used. Resolves true
 * once signed in, false if the customer backed out.
 */
export async function signInWithGoogle(): Promise<boolean> {
  const google = loadNativeGoogle();
  if (!google) return signInWithBrowser('google');

  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = google;
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return false;

    const { idToken } = response.data;
    if (!idToken) throw new Error('Google sign-in did not return an ID token');

    // The iOS Google SDK adds its own nonce, which the app never sees, so the Google provider in
    // Supabase has "Skip nonce check" turned on.
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) throw error;
    return true;
  } catch (err) {
    if (
      isErrorWithCode(err) &&
      (err.code === statusCodes.SIGN_IN_CANCELLED || err.code === statusCodes.IN_PROGRESS)
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Forget the Google account on this phone, so the next "Continue with Google" shows the account picker
 * again instead of silently reusing the previous customer's account.
 */
export async function signOutOfGoogle(): Promise<void> {
  const google = loadNativeGoogle();
  if (!google) return;
  await google.GoogleSignin.signOut().catch(() => undefined);
}
