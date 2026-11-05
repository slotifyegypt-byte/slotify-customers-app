import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, spacing, useColors, type ColorToken } from '@/theme';

import { ThemedText } from './ThemedText';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'brand' | 'mint';

const TONES: Record<Tone, { text: ColorToken; background: ColorToken }> = {
  success: { text: 'success', background: 'successTint' },
  warning: { text: 'warning', background: 'warningTint' },
  danger: { text: 'danger', background: 'dangerTint' },
  neutral: { text: 'textSecondary', background: 'neutralTint' },
  brand: { text: 'brandAccent', background: 'brandTint' },
  mint: { text: 'mintInk', background: 'mintTint' },
};

interface PillProps {
  label: string;
  tone?: Tone;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /** A small dot before the label, for live states ("Open now"). */
  dot?: boolean;
}

/** A small status chip: sentence case, a soft tinted background and the matching ink. State is the word first, colour second. */
export function Pill({ label, tone = 'neutral', icon, dot }: PillProps) {
  const colors = useColors();
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: colors[t.background] }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: colors[t.text] }]} /> : null}
      {icon ? <Ionicons name={icon} size={12} color={colors[t.text]} /> : null}
      <ThemedText variant="label" color={t.text}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
