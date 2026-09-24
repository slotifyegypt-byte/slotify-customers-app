import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

import { appConfig } from '@/lib/config';

import { exchangeGoogleCode } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

/**
 * Backend-driven OAuth (customer-app-api-map.md §1) — VERIFIED against the
 * backend source (2026-09-19):
 *
 * `GET /customers/auth/google` takes NO query params. Google redirects to
 * the backend's own callback, which then redirects the browser to
 * `{FRONTEND_URL}/auth/callback?code=...` — now set to `slotify://auth/callback`.
 *
 * On Android (confirmed via live testing), that redirect arrives as a fresh
 * launch Intent targeting `slotify://auth/callback` — the OS brings the app
 * back to the foreground as a new navigation rather than handing control
 * back to whoever opened the browser, so `app/auth/callback.tsx` is what
 * completes sign-in there.
 *
 * On iOS, `openAuthSessionAsync` uses `ASWebAuthenticationSession`, which
 * intercepts the `slotify://` redirect itself and resolves this promise
 * with the redirect URL *instead of* dispatching a normal deep-link/`Linking`
 * event — so `app/auth/callback.tsx` never gets a chance to run there (this
 * was the bug behind Google sign-in silently bouncing back to the sign-in
 * screen on iOS: the code was being thrown away). Handling a `type:
 * 'success'` result here, in addition to the callback screen, covers both
 * platforms' actual behavior instead of assuming Android's.
 */
export function useGoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const setTokens = useAuthStore((s) => s.setTokens);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const redirectUri = makeRedirectUri({ scheme: 'slotify', path: 'auth/callback' });
      const authUrl = `${appConfig.apiBaseUrl}/customers/auth/google`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success') {
        const code = Linking.parse(result.url).queryParams?.code;
        if (typeof code !== 'string') {
          throw new Error('Google sign-in did not return an authorization code');
        }
        const tokens = await exchangeGoogleCode(code);
        setTokens(tokens.access_token, tokens.refresh_token);
        router.replace('/');
      }
      // 'dismiss'/'cancel' (the user closed the browser) is a no-op — not an error.
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Google sign-in failed'));
    } finally {
      setIsLoading(false);
    }
  }, [setTokens]);

  return { signIn, isLoading, error };
}
