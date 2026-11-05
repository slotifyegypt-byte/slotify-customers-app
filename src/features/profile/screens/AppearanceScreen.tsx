import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ThemedText } from '@/components/ThemedText';
import { useThemePreferenceStore, type ThemePreference } from '@/lib/theme/themePreferenceStore';
import { enter, spacing, useColors } from '@/theme';

import { OptionCard } from '../components/OptionCard';
import { ThemeSwatch } from '../components/ThemeSwatch';

const OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export function AppearanceScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const preference = useThemePreferenceStore((state) => state.preference);
  const setPreference = useThemePreferenceStore((state) => state.setPreference);

  return (
    <Screen>
      <ScreenHeader title={t('appearance.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {OPTIONS.map((option, index) => (
            <Animated.View key={option} entering={enter(index)}>
              <OptionCard
                title={t(`appearance.${option}`)}
                subtitle={t(`appearance.${option}Body`)}
                selected={preference === option}
                onPress={() => setPreference(option)}
                leading={<ThemeSwatch mode={option} />}
              />
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={enter(3)} style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textTertiary} />
          <ThemedText variant="caption" color="textTertiary" style={styles.hintText}>
            {t('appearance.hint')}
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
  hint: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.xs },
  hintText: { flex: 1 },
});
