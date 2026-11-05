import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { ThemedText } from '@/components/ThemedText';
import { radius, shadows, spacing, useColors } from '@/theme';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  /** A preview or glyph shown before the text. */
  leading?: ReactNode;
}

/** One choice out of a few (appearance, language): a card with a clear selected state and a check, announced as a radio. */
export function OptionCard({ title, subtitle, selected, onPress, leading }: OptionCardProps) {
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected, checked: selected }}
      scaleTo={0.985}
      style={[
        styles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.brandAccent : colors.border,
        },
      ]}
    >
      {leading}
      <View style={styles.text}>
        <ThemedText variant="bodyMedium" numberOfLines={1} style={styles.start}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color="textTertiary" numberOfLines={2} style={styles.start}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[
          styles.check,
          selected
            ? { backgroundColor: colors.brand, borderColor: colors.brand }
            : { borderColor: colors.border },
        ]}
      >
        {selected ? <Ionicons name="checkmark" size={15} color={colors.textOnBrand} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  // Text aligns to the layout's start, even when it is in the other script (an Arabic name in an English layout).
  start: { textAlign: I18nManager.isRTL ? 'right' : 'left' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
