import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

// Brand guide (App UI Reference: Splash/Welcome screen) — centered icon above
// a dark-purple wordmark on a white background. `icon.png` is the calendar/
// pin mark alone (flat #FFFFFF corners == colors.background, so it blends
// with no wrapper needed).
export function SignInScreen() {
  const { t } = useTranslation();
  const { signIn, isLoading, error } = useGoogleSignIn();

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
        onPress={signIn}
        loading={isLoading}
        style={{ marginBottom: spacing.sm }}
      />
      {/* No backend support yet (customer-app-api-map.md §1) — shown per design, disabled. */}
      <Button
        label={t('auth.continueWithApple')}
        variant="ghost"
        disabled
        style={{ marginBottom: spacing.sm }}
      />
      <Button label={t('auth.continueWithPhone')} variant="ghost" disabled />
    </Screen>
  );
}
