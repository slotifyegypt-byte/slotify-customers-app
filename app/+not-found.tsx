import { Link, Stack, usePathname, useSegments } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/Screen';
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/theme';

export default function NotFoundScreen() {
  // TEMP DEBUG: show exactly what path/segments failed to match, so this is
  // visible on-device without needing adb/device logs.
  const pathname = usePathname();
  const segments = useSegments();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Screen style={styles.container}>
        <ThemedText variant="h2">This screen doesn&apos;t exist.</ThemedText>
        <ThemedText variant="body" color="danger" style={styles.debug}>
          pathname: {pathname || '(empty)'}
        </ThemedText>
        <ThemedText variant="body" color="danger" style={styles.debug}>
          segments: {JSON.stringify(segments)}
        </ThemedText>
        <Link href="/(tabs)/home" style={styles.link}>
          <ThemedText variant="bodyMedium" color="accentSecondary">
            Go to home screen!
          </ThemedText>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  link: { marginTop: spacing.md, paddingVertical: spacing.sm },
  debug: { marginTop: spacing.sm, textAlign: 'center' },
});
