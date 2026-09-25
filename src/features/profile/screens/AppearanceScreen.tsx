import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { useThemePreferenceStore, type ThemePreference } from '@/lib/theme/themePreferenceStore';
import { radius, spacing, useColors } from '@/theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' }, // TODO i18n
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function AppearanceScreen() {
  const colors = useColors();
  const preference = useThemePreferenceStore((state) => state.preference);
  const setPreference = useThemePreferenceStore((state) => state.setPreference);
  const styles = createStyles(colors);

  return (
    <Screen>
      <ScreenHeader title="Appearance" />
      <ScrollView contentContainerStyle={styles.padded}>
        <View style={styles.section}>
          {OPTIONS.map((option, index) => {
            const selected = preference === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.row, index === OPTIONS.length - 1 && styles.rowLast]}
                onPress={() => setPreference(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <ThemedText variant="bodyMedium">{option.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText variant="caption" color="textSecondary" style={styles.hint}>
          {/* TODO i18n */}
          &ldquo;System&rdquo; follows your device&apos;s appearance setting. Slotify defaults to Light.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    padded: { padding: spacing.lg },
    section: {
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    rowLast: { borderBottomWidth: 0 },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: { borderColor: colors.brandAccent },
    radioInner: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.brandAccent },
    hint: { marginTop: spacing.md, paddingHorizontal: spacing.xs },
  });
