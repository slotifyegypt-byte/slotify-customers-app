import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { setAppLocale, type SupportedLocale } from '@/lib/i18n';
import { colors, radius, spacing } from '@/theme';

const LANGUAGES: { value: SupportedLocale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];

export function LanguageScreen() {
  const { i18n } = useTranslation();
  const [pending, setPending] = useState<SupportedLocale | null>(null);
  const current = (i18n.language as SupportedLocale) ?? 'en';

  const handleSelect = (locale: SupportedLocale) => {
    if (locale === current || pending) return;
    setPending(locale);
    const needsRestart = setAppLocale(locale);
    if (needsRestart) {
      Alert.alert(
        'Restart required', // TODO i18n
        'Slotify needs to restart to switch to a right-to-left layout.', // TODO i18n
        [
          {
            text: 'Restart now', // TODO i18n
            onPress: () => {
              Updates.reloadAsync().catch(() => setPending(null));
            },
          },
        ],
        { cancelable: false },
      );
    } else {
      setPending(null);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Language" />
      <ScrollView contentContainerStyle={styles.padded}>
        <View style={styles.section}>
          {LANGUAGES.map((lang, index) => {
            const selected = current === lang.value;
            return (
              <Pressable
                key={lang.value}
                style={[styles.row, index === LANGUAGES.length - 1 && styles.rowLast]}
                onPress={() => handleSelect(lang.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected ? <View style={styles.radioInner} /> : null}
                </View>
                <ThemedText variant="bodyMedium">{lang.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={colors.brandAccent} />
          <ThemedText variant="caption" color="textSecondary" style={styles.hintText}>
            {/* TODO i18n */}
            Selecting العربية switches the whole app to a right-to-left layout, not just this screen.
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { padding: spacing.lg },
  title: { marginBottom: spacing.lg },
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
  hint: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.brandTint,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  hintText: { flex: 1 },
});
