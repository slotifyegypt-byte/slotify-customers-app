import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '@/lib/supabase';
import { spacing } from '@/theme';

// Dev/staging only — SignInScreen renders this when `appConfig.env !== 'production'`.
// The demo accounts (e.g. lina@slotify.dev) are email/password users, while the
// app itself only offers Google/Apple, so without this form they can't be used
// to exercise the signed-in flows. Deliberately not localised: it never ships
// to customers.
export function DevPasswordSignIn() {
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
      <ThemedText variant="caption" color="textTertiary" style={styles.label}>
        Development only
      </ThemedText>
      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <TextField
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
      />
      {error ? (
        <ThemedText variant="body" color="danger" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label="Sign in with password"
        variant="secondary"
        onPress={signIn}
        loading={isLoading}
        disabled={!email.trim() || !password}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.lg, gap: spacing.sm },
  label: { textAlign: 'center' },
  error: { textAlign: 'center' },
});
