import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Trans, useTranslation } from 'react-i18next';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { appConfig } from '@/lib/config';
import { openLegalUrl } from '@/lib/legal';
import { enter, radius, spacing, useColors, useTheme } from '@/theme';

import { DevPasswordSignIn } from '../components/DevPasswordSignIn';
import { useAppleSignIn } from '../hooks/useAppleSignIn';
import { useOAuthSignIn } from '../hooks/useOAuthSignIn';

const POINTS = [
  { icon: 'flash-outline', key: 'auth.pointBook' },
  { icon: 'notifications-outline', key: 'auth.pointRemind' },
  { icon: 'star-outline', key: 'auth.pointReviews' },
] as const;

// A deep-indigo welcome (the logo's own colour) with a white sheet rising from the bottom for the way in:
// one decision per screen. `logo-mark.png` is the calendar mark with a transparent background, so it sits in a white tile.
export function SignInScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { scheme } = useTheme();
  const google = useOAuthSignIn('google');
  const apple = useAppleSignIn();
  const error = google.error ?? apple.error;

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.hero }]}>
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringBig, { borderColor: colors.onHeroTint }]}
      />
      <View
        pointerEvents="none"
        style={[styles.ring, styles.ringSmall, { borderColor: colors.onHeroTint }]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Animated.View entering={enter(0)} style={styles.tile}>
            <Image
              source={require('../../../../assets/images/logo-mark.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </Animated.View>
          <Animated.View entering={enter(1)} style={styles.titleBlock}>
            <ThemedText variant="display" color="onHero">
              {t('auth.title')}
            </ThemedText>
            <ThemedText variant="bodyLarge" color="onHeroMuted">
              {t('auth.subtitle')}
            </ThemedText>
          </Animated.View>
          <View style={styles.points}>
            {POINTS.map((p, i) => (
              <Animated.View key={p.key} entering={enter(2 + i)} style={styles.point}>
                <View style={[styles.pointIcon, { backgroundColor: colors.onHeroTint }]}>
                  <Ionicons name={p.icon} size={17} color={colors.onHero} />
                </View>
                <ThemedText variant="body" color="onHero" style={styles.pointText}>
                  {t(p.key)}
                </ThemedText>
              </Animated.View>
            ))}
          </View>
        </View>

        <Animated.View
          entering={enter(5)}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          {error ? (
            <ThemedText variant="body" color="danger" style={styles.error}>
              {error.message}
            </ThemedText>
          ) : null}

          <Button
            label={t('auth.continueWithGoogle')}
            variant="ghost"
            icon="logo-google"
            onPress={google.signIn}
            loading={google.isLoading}
            disabled={apple.isLoading}
          />
          {Platform.OS === 'ios' ? (
            // Apple's own button, as App Store review requires for the native flow.
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={
                scheme === 'dark'
                  ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={radius.pill}
              style={styles.apple}
              onPress={() => {
                if (!apple.isLoading && !google.isLoading) apple.signIn();
              }}
            />
          ) : (
            <Button
              label={t('auth.continueWithApple')}
              variant="primary"
              icon="logo-apple"
              onPress={apple.signIn}
              loading={apple.isLoading}
              disabled={google.isLoading}
            />
          )}

          {/* Demo accounts are email/password; only dev and staging builds offer it. An unset APP_ENV falls
              back to 'development', so this must be an allow-list. */}
          {__DEV__ || appConfig.env === 'staging' ? <DevPasswordSignIn /> : null}

          <ThemedText variant="caption" color="textTertiary" style={styles.legal}>
            <Trans
              i18nKey="auth.legalNotice"
              components={{
                terms: (
                  <ThemedText
                    variant="captionStrong"
                    color="brandAccent"
                    accessibilityRole="link"
                    accessibilityLabel={t('auth.legalTermsLabel')}
                    onPress={() => openLegalUrl('terms')}
                  />
                ),
                privacy: (
                  <ThemedText
                    variant="captionStrong"
                    color="brandAccent"
                    accessibilityRole="link"
                    accessibilityLabel={t('auth.legalPrivacyLabel')}
                    onPress={() => openLegalUrl('privacy')}
                  />
                ),
              }}
            />
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  ring: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  ringBig: { width: 360, height: 360, end: -140, top: -120 },
  ringSmall: { width: 220, height: 220, end: -70, top: -50 },
  hero: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  tile: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 54, height: 54 },
  titleBlock: { gap: spacing.xs },
  points: { gap: spacing.sm + 2 },
  point: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: { flex: 1 },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  apple: { height: 52, alignSelf: 'stretch' },
  error: { textAlign: 'center' },
  legal: { textAlign: 'center', marginTop: spacing.xs },
});
