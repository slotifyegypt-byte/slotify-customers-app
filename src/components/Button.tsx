import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { PressableProps } from 'react-native';

import { radius, spacing, useColors, type ColorToken, type Colors } from '@/theme';

import { PressableScale } from './PressableScale';
import { ThemedText } from './ThemedText';

// primary / accent: the deep-indigo filled action (one per screen). secondary: a soft tinted action.
// ghost: a quiet outlined action. `accent` is kept for call sites written before the redesign; it looks like primary.
type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
// Opt-in override for destructive actions (e.g. "Cancel appointment").
type Tone = 'default' | 'danger';
type Size = 'md' | 'sm';
type IconName = ComponentProps<typeof Ionicons>['name'];

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: object;
}

export function Button({
  label,
  variant = 'primary',
  tone = 'default',
  size = 'md',
  icon,
  loading,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colors = useColors();
  const look = lookFor(colors, variant, tone);
  const isDisabled = disabled || loading;
  const filled = variant === 'primary' || variant === 'accent';
  const textColor: ColorToken = isDisabled && filled ? 'disabledText' : look.text;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled }}
      disabled={isDisabled}
      scaleTo={0.975}
      style={[
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor: isDisabled && filled ? colors.disabled : look.background },
        look.border
          ? { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: look.border }
          : null,
        fullWidth && styles.fullWidth,
        isDisabled && !filled && styles.dimmed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors[look.text]} />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={colors[textColor]} />
          ) : null}
          <ThemedText
            variant="button"
            color={textColor}
            style={size === 'sm' ? styles.smallText : undefined}
          >
            {label}
          </ThemedText>
        </View>
      )}
    </PressableScale>
  );
}

function lookFor(
  colors: Colors,
  variant: Variant,
  tone: Tone,
): { background: string; text: ColorToken; border?: string } {
  if (tone === 'danger') {
    if (variant === 'ghost')
      return { background: colors.surface, text: 'danger', border: colors.danger };
    if (variant === 'secondary') return { background: colors.dangerTint, text: 'danger' };
    return { background: colors.danger, text: 'textInverse' };
  }
  if (variant === 'secondary') return { background: colors.brandTint, text: 'brand' };
  if (variant === 'ghost')
    return { background: colors.surface, text: 'textPrimary', border: colors.border };
  return { background: colors.brand, text: 'textOnBrand' };
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  medium: { minHeight: 52, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  small: { minHeight: 40, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  smallText: { fontSize: 14, lineHeight: 18 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  fullWidth: { alignSelf: 'stretch' },
  dimmed: { opacity: 0.5 },
});
