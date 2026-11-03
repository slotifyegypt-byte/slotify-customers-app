import * as AppleAuthentication from 'expo-apple-authentication';
import { useTranslation } from 'react-i18next';
import { Image, Platform } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { appConfig } from '@/lib/config';
import { radius, spacing, useTheme } from '@/theme';

import { DevPasswordSignIn } from '../components/DevPasswordSignIn';
import { useAppleSignIn } from '../hooks/useAppleSignIn';
import { useOAuthSignIn } from '../hooks/useOAuthSignIn';

// Brand guide (App UI Reference: Splash/Welcome screen) — centered icon above
// a dark-purple wordmark on a white background. `icon.png` is the calendar/
// pin mark alone (flat #FFFFFF corners == colors.background, so it blends
// with no wrapper needed).
export function SignInScreen() {
  const { t } = useTranslation();
  const { scheme } = useTheme();
  const google = useOAuthSignIn('google');
  const apple = useAppleSignIn();
  const error = google.error ?? apple.error;

  return (
    <Screen style={{ padding: spacing.lg, justifyContent: 'center' }}>
      <Image
        source={require('../../../../assets/images/icon.png')}
        style={{ width: 96, height: 96, alignSelf: 'center', marginBottom: spacing.md }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <ThemedText variant="display" color="brand" style={{ textAlign: 'center' }}>
        {t('auth.title')}
      </ThemedText>
      <ThemedText
        variant="bodyLarge"
        color="textSecondary"
        style={{ textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl }}
      >
        {t('auth.subtitle')}
      </ThemedText>

      {error ? (
        <ThemedText
          variant="body"
          color="danger"
          style={{ textAlign: 'center', marginBottom: spacing.sm }}
        >
          {error.message}
        </ThemedText>
      ) : null}

      <Button
        label={t('auth.continueWithGoogle')}
        onPress={google.signIn}
        loading={google.isLoading}
        disabled={apple.isLoading}
        style={{ marginBottom: spacing.sm }}
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
          style={{ height: 48, alignSelf: 'stretch' }}
          onPress={() => {
            if (!apple.isLoading && !google.isLoading) apple.signIn();
          }}
        />
      ) : (
        <Button
          label={t('auth.continueWithApple')}
          variant="ghost"
          onPress={apple.signIn}
          loading={apple.isLoading}
          disabled={google.isLoading}
        />
      )}

      {/* Demo accounts are email/password; only dev and staging builds offer it. An
          unset APP_ENV falls back to 'development', so this must be an allow-list. */}
      {__DEV__ || appConfig.env === 'staging' ? <DevPasswordSignIn /> : null}
    </Screen>
  );
}
