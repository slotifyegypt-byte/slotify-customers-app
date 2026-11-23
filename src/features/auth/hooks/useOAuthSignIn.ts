import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { signInWithGoogle } from '../api/googleSignIn';
import { signInWithBrowser, type OAuthProvider } from '../api/oauth';

/** Google (native sheet, browser as fallback), and Apple's browser flow on Android. */
export function useOAuthSignIn(provider: OAuthProvider) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // false = the user backed out, which isn't an error.
      const signedIn = provider === 'google' ? await signInWithGoogle() : await signInWithBrowser(provider);
      if (signedIn) {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign-in failed'));
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  return { signIn, isLoading, error };
}
