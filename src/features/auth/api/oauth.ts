import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

// Must be listed under Authentication > URL Configuration > Redirect URLs
// in the Supabase dashboard.
export const oauthRedirectUri = () => makeRedirectUri({ scheme: 'slotify', path: 'auth/callback' });

// An auth code is single-use, and depending on the platform the redirect can
// reach both the WebBrowser promise and app/auth/callback.tsx — share one
// exchange per code so the second caller doesn't fail on a spent code.
const exchanges = new Map<string, Promise<void>>();

export function exchangeCode(code: string): Promise<void> {
  let exchange = exchanges.get(code);
  if (!exchange) {
    exchange = supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) throw error;
    });
    exchanges.set(code, exchange);
  }
  return exchange;
}

/** Complete sign-in from a `slotify://auth/callback?code=...` redirect URL. */
export async function completeOAuthRedirect(url: string): Promise<void> {
  const params = Linking.parse(url).queryParams ?? {};
  const code = params.code;
  if (typeof code !== 'string') {
    const reason = params.error_description ?? params.error;
    throw new Error(typeof reason === 'string' ? reason : 'Sign-in did not return an authorization code');
  }
  await exchangeCode(code);
}

/**
 * Browser-based OAuth through Supabase (PKCE). Resolves true once signed in,
 * false if the user closed the browser.
 *
 * On iOS, `openAuthSessionAsync` uses `ASWebAuthenticationSession`, which
 * intercepts the `slotify://` redirect and resolves with the URL, so sign-in
 * completes here. On Android the redirect arrives as a fresh launch Intent,
 * so `app/auth/callback.tsx` completes it instead (the PKCE verifier is in
 * persistent storage, so either path can exchange the code).
 */
export async function signInWithBrowser(provider: OAuthProvider): Promise<boolean> {
  const redirectTo = oauthRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  await completeOAuthRedirect(result.url);
  return true;
}
