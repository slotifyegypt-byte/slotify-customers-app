import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { radius, spacing, useColors, type Colors } from '@/theme';

// Dev/staging only — SignInScreen renders this when `appConfig.env !== 'production'`.
// The demo accounts (e.g. lina@slotify.dev) are email/password users, while the
// app itself only offers Google/Apple, so without this form they can't be used
// to exercise the signed-in flows. Deliberately not localised: it never ships
// to customers.
export function DevPasswordSignIn() {
  const colors = useColors();
  const styles = createStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" color="textSecondary" style={styles.label}>
        DEV ONLY
      </ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        secureTextEntry
        style={styles.input}
      />
      {error ? (
        <ThemedText variant="body" color="danger" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label="Sign in with password"
        variant="ghost"
        onPress={signIn}
        loading={isLoading}
        disabled={!email.trim() || !password}
      />
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { marginTop: spacing.xl },
    label: { marginBottom: spacing.xs, textAlign: 'center' },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      color: colors.textPrimary,
    },
    error: { textAlign: 'center', marginBottom: spacing.sm },
  });
