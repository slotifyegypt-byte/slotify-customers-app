import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

import { radius, shadows, useColors } from '@/theme';

import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  accessibilityLabel: string;
  /** surface: a white disc with a hairline. tint: a soft brand wash. overlay: floats over a photo or map. */
  variant?: 'surface' | 'tint' | 'overlay';
  size?: number;
  color?: string;
}

/** A round icon button; always labelled for screen readers. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 40,
  color,
}: IconButtonProps) {
  const colors = useColors();
  const background =
    variant === 'tint'
      ? colors.brandTint
      : variant === 'overlay'
        ? colors.surfaceTranslucent
        : colors.surface;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      scaleTo={0.92}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        variant === 'surface'
          ? { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: colors.border }
          : null,
        variant === 'overlay' ? shadows.md : null,
      ]}
    >
      <Ionicons
        name={icon}
        size={Math.round(size * 0.48)}
        color={color ?? (variant === 'tint' ? colors.brand : colors.textPrimary)}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
});
