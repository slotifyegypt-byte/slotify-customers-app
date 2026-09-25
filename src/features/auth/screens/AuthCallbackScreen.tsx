import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { spacing, useColors } from '@/theme';

import { exchangeGoogleCode } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

/**
 * Real screen for `slotify://auth/callback?code=...` — see useGoogleSignIn.ts
 * for why this, not a resolved WebBrowser promise, is what actually
 * completes Google sign-in (confirmed via live Android testing 2026-09-19).
 */
export function AuthCallbackScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { code, error: oauthError } = useLocalSearchParams<{ code?: string; error?: string }>();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const startedRef = useRef(false); // guard against double-exchange (an auth code is single-use)

  // Derived at render time (not via setState-in-effect) since it depends only
  // on the route params themselves, not on any async work.
  const missingCodeError = !code ? (oauthError ?? t('auth.noAuthCode')) : null;
  const error = missingCodeError ?? exchangeError;

  useEffect(() => {
    if (startedRef.current || !code) return;
    startedRef.current = true;

    exchangeGoogleCode(code)
      .then((tokens) => {
        setTokens(tokens.access_token, tokens.refresh_token);
        router.replace('/');
      })
      .catch((err) => {
        setExchangeError(err instanceof Error ? err.message : t('auth.signInFailedGeneric'));
      });
  }, [code, setTokens, t]);

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
