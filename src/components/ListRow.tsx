import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';

import { radius, spacing, useColors, type ColorToken } from '@/theme';

import { PressableScale } from './PressableScale';
import { ThemedText } from './ThemedText';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** Which semantic colour washes the icon well and tints the glyph. */
  iconTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  /** Text shown before the chevron (a count, the current language). */
  value?: string;
  /** Replaces the chevron (a switch, a pill). */
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

const TONES: Record<
  NonNullable<ListRowProps['iconTone']>,
  { glyph: ColorToken; well: ColorToken }
> = {
  brand: { glyph: 'brandAccent', well: 'brandTint' },
  success: { glyph: 'success', well: 'successTint' },
  warning: { glyph: 'warning', well: 'warningTint' },
  danger: { glyph: 'danger', well: 'dangerTint' },
  neutral: { glyph: 'textSecondary', well: 'neutralTint' },
};

/** One row of a settings-style list: an icon well, a title (and subtitle), and a value, switch or chevron. Put rows inside a Card with `padding="none"`. */
export function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'brand',
  value,
  trailing,
  onPress,
  destructive,
}: ListRowProps) {
  const colors = useColors();
  const tone = TONES[destructive ? 'danger' : iconTone];
  const body = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.well, { backgroundColor: colors[tone.well] }]}>
          <Ionicons name={icon} size={18} color={colors[tone.glyph]} />
        </View>
      ) : null}
      <View style={styles.text}>
        <ThemedText
          variant="bodyMedium"
          color={destructive ? 'danger' : 'textPrimary'}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="caption" color="textTertiary" numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText variant="body" color="textTertiary">
          {value}
        </ThemedText>
      ) : null}
      {trailing ??
        (onPress ? (
          <Ionicons
            name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={colors.textTertiary}
          />
        ) : null)}
    </View>
  );
  if (!onPress) return body;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      scaleTo={0.99}
    >
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 60,
  },
  well: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
});
