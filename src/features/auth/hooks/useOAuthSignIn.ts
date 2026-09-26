import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { signInWithBrowser, type OAuthProvider } from '../api/oauth';

/** Browser-based sign-in through Supabase (Google, and Apple on Android). */
export function useOAuthSignIn(provider: OAuthProvider) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // false = the user closed the browser, which isn't an error.
      if (await signInWithBrowser(provider)) {
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
