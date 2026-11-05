import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, shadows, spacing, useColors } from '@/theme';

import { PressableScale } from './PressableScale';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  /** Inner padding; 'none' for cards that hold full-bleed content (a photo, a list). */
  padding?: 'none' | 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const PADDING = { none: 0, sm: spacing.sm, md: spacing.md } as const;

/** A white surface on the tinted canvas: hairline border and a soft shadow. Tappable when given `onPress`. */
export function Card({ children, onPress, padding = 'md', style, accessibilityLabel }: CardProps) {
  const colors = useColors();
  const surface = [
    styles.card,
    shadows.sm,
    { backgroundColor: colors.surface, borderColor: colors.border, padding: PADDING[padding] },
    style,
  ];
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={surface}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={surface}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth * 2, overflow: 'hidden' },
});
