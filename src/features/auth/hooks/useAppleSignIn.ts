import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

import { setPendingProfileName } from '../pendingProfile';

import { useOAuthSignIn } from './useOAuthSignIn';

/**
 * iOS: the native "Sign in with Apple" sheet, whose identity token is handed
 * to Supabase (App Store review expects the native flow when other social
 * logins are offered). Android has no native Apple sign-in, so it falls back
 * to Supabase's browser flow.
 */
export function useAppleSignIn() {
  const browserSignIn = useOAuthSignIn('apple');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const nativeSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Apple embeds the SHA-256 of the nonce in the identity token; Supabase
      // re-hashes the raw nonce to check it, which prevents token replay.
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) {
        throw new Error('Apple sign-in did not return an identity token');
      }

      const { givenName, familyName } = credential.fullName ?? {};
      if (givenName || familyName) {
        setPendingProfileName({ first_name: givenName ?? undefined, last_name: familyName ?? undefined });
      }

      const { error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });
      if (signInError) throw signInError;
      router.replace('/');
    } catch (err) {
      // The user dismissed the Apple sheet — not an error.
      if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return;
      setError(err instanceof Error ? err : new Error('Apple sign-in failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (Platform.OS !== 'ios') return browserSignIn;
  return { signIn: nativeSignIn, isLoading, error };
}
