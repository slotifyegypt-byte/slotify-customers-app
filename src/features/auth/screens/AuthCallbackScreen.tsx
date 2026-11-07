import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { enter, radius, spacing, useColors } from '@/theme';

import { exchangeCode } from '../api/oauth';

/**
 * Real screen for `slotify://auth/callback?code=...` — see signInWithBrowser
 * in api/oauth.ts for why this, not a resolved WebBrowser promise, is what
 * completes browser sign-in on Android (confirmed via live testing 2026-09-19).
 */
export function AuthCallbackScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const startedRef = useRef(false); // guard against double-exchange (an auth code is single-use)

  // Derived at render time (not via setState-in-effect) since it depends only
  // on the route params themselves, not on any async work. The link's own `error` text is never shown: anyone
  // can open slotify://auth/callback?error_description=... and put words on this screen.
  const missingCodeError = !code ? t('auth.noAuthCode') : null;
  const error = missingCodeError ?? exchangeError;

  useEffect(() => {
    if (startedRef.current || !code) return;
    startedRef.current = true;

    // Signing in updates the auth store via Supabase's auth listener.
    exchangeCode(code)
      .then(() => router.replace('/'))
      .catch(() => {
        setExchangeError(t('auth.signInFailedGeneric'));
      });
  }, [code, t]);

  if (error) {
    return (
      <Screen>
        <Animated.View entering={enter(0)} style={styles.fill}>
          <EmptyState
            icon="alert-circle-outline"
            title={t('auth.signInFailedTitle')}
            body={error}
            actionLabel={t('auth.backToSignIn')}
            onAction={() => router.replace('/sign-in')}
          />
        </Animated.View>
      </Screen>
    );
  }

  // The same deep-indigo welcome the sign-in screen opens with, so the hand-back from the browser feels continuous.
  return (
    <Screen background="hero" style={styles.center}>
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringBig, { borderColor: colors.onHeroTint }]}
      />
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringSmall, { borderColor: colors.onHeroTint }]}
      />
      <Animated.View entering={enter(0)} style={[styles.tile, { backgroundColor: colors.onHero }]}>
        <Image
          source={require('../../../../assets/images/logo-mark.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
      <Animated.View entering={enter(1)} style={styles.status} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.onHero} />
        <ThemedText variant="bodyLarge" color="onHero">
          {t('auth.completingSignIn')}
        </ThemedText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  ring: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  ringBig: { width: 360, height: 360, end: -140, top: -120 },
  ringSmall: { width: 220, height: 220, end: -70, top: -50 },
  tile: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 54, height: 54 },
  status: { alignItems: 'center', gap: spacing.sm },
});
