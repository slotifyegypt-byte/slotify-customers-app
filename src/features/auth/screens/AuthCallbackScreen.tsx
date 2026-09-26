import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { spacing, useColors } from '@/theme';

import { exchangeCode } from '../api/oauth';

/**
 * Real screen for `slotify://auth/callback?code=...` — see signInWithBrowser
 * in api/oauth.ts for why this, not a resolved WebBrowser promise, is what
 * completes browser sign-in on Android (confirmed via live testing 2026-09-19).
 */
export function AuthCallbackScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const {
    code,
    error: oauthError,
    error_description: oauthErrorDescription,
  } = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const startedRef = useRef(false); // guard against double-exchange (an auth code is single-use)

  // Derived at render time (not via setState-in-effect) since it depends only
  // on the route params themselves, not on any async work.
  const missingCodeError = !code ? (oauthErrorDescription ?? oauthError ?? t('auth.noAuthCode')) : null;
  const error = missingCodeError ?? exchangeError;

  useEffect(() => {
    if (startedRef.current || !code) return;
    startedRef.current = true;

    // Signing in updates the auth store via Supabase's auth listener.
    exchangeCode(code)
      .then(() => router.replace('/'))
      .catch((err) => {
        setExchangeError(err instanceof Error ? err.message : t('auth.signInFailedGeneric'));
      });
  }, [code, t]);

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
      {error ? (
        <>
          <ThemedText variant="h3" style={{ textAlign: 'center' }}>
            {t('auth.signInFailedTitle')}
          </ThemedText>
          <ThemedText
            variant="body"
            color="textSecondary"
            style={{ textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg }}
          >
            {error}
          </ThemedText>
          <Button label={t('auth.backToSignIn')} fullWidth={false} onPress={() => router.replace('/sign-in')} />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.brand} />
          <ThemedText variant="body" color="textSecondary" style={{ marginTop: spacing.sm }}>
            {t('auth.completingSignIn')}
          </ThemedText>
        </>
      )}
    </Screen>
  );
}
