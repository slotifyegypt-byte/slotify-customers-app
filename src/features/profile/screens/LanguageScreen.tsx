import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { setAppLocale, type SupportedLocale } from '@/lib/i18n';
import { enter, radius, spacing, useColors } from '@/theme';

import { OptionCard } from '../components/OptionCard';

// Each language is named in its own script, so it can be found even when the app is in the other one.
const LANGUAGES: { value: SupportedLocale; label: string; layoutKey: 'ltr' | 'rtl' }[] = [
  { value: 'en', label: 'English', layoutKey: 'ltr' },
  { value: 'ar', label: 'العربية', layoutKey: 'rtl' },
];

export function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const [pending, setPending] = useState<SupportedLocale | null>(null);
  const current = (i18n.language as SupportedLocale) ?? 'en';

  const handleSelect = (locale: SupportedLocale) => {
    if (locale === current || pending) return;
    setPending(locale);
    const needsRestart = setAppLocale(locale);
    if (needsRestart) {
      Alert.alert(
        t('language.restartTitle'),
        t('language.restartBody'),
        [
          {
            text: t('language.restartNow'),
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
      <ScreenHeader title={t('language.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {LANGUAGES.map((lang, index) => (
            <Animated.View key={lang.value} entering={enter(index)}>
              <OptionCard
                title={lang.label}
                subtitle={t(`language.${lang.layoutKey}`)}
                selected={current === lang.value}
                onPress={() => handleSelect(lang.value)}
              />
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={enter(2)}
          style={[styles.hint, { backgroundColor: colors.brandTint }]}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.brandAccent} />
          <ThemedText variant="caption" color="textSecondary" style={styles.hintText}>
            {t('language.hint')}
          </ThemedText>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.md,
  },
  options: { gap: spacing.sm },
  hint: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  hintText: { flex: 1 },
});
