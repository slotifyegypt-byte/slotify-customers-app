import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radius, spacing, type ColorToken } from '@/theme';

import { ThemedText } from './ThemedText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
// Opt-in override for destructive actions (e.g. "Cancel appointment") — kept
// separate from `variant` so every existing call site is unaffected by
// default (`tone` defaults to 'default', which is a no-op).
type Tone = 'default' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  tone?: Tone;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  tone = 'default',
  loading,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        tone === 'danger' && dangerStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style as never,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.brand : colors.accent} />
      ) : (
        <ThemedText variant="button" color={tone === 'danger' ? dangerTextColor[variant] : textColor[variant]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const textColor: Record<Variant, 'brand' | 'textOnBrand'> = {
  primary: 'brand',
  secondary: 'textOnBrand',
  ghost: 'brand',
  accent: 'textOnBrand',
};

const dangerTextColor: Record<Variant, ColorToken> = {
  primary: 'textOnBrand',
  secondary: 'textOnBrand',
  ghost: 'danger',
  accent: 'textOnBrand',
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.brand },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  // Bright-purple CTA used for the booking flow's primary action (Confirm
  // Booking) — matches the mockups' "selected/CTA accent" purple (see
  // colors.brandAccent), distinct from `secondary`'s dark navy brand color.
  accent: { backgroundColor: colors.brandAccent },
});

const dangerStyles = StyleSheet.create({
  primary: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.danger },
  accent: { backgroundColor: colors.danger },
  ghost: { borderColor: colors.danger },
});
