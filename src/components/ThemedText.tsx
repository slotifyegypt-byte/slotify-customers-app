import { I18nManager, StyleSheet, Text, type TextProps } from 'react-native';

import { typeScale, useColors, type ColorToken, type TypeScaleToken } from '@/theme';

interface ThemedTextProps extends TextProps {
  variant?: TypeScaleToken;
  color?: ColorToken;
  /**
   * A short label (button, chip, pill, tab): kept whole on one line and shrunk to fit if it has to be.
   * Android can measure such a label a pixel narrower than it draws it at some font sizes, and the last word
   * then wraps onto a hidden second line ("Continue with Google" showed as "Continue with"). It also stops a
   * label overflowing its button when the phone's text size is set very large.
   */
  fit?: boolean;
}

// A paragraph normally takes the direction of its first letter, so a Latin name ("Omar", "Glamour Studio") inside
// the mirrored Arabic layout stays left-aligned while everything around it is right-aligned. Pinning the paragraph
// to the app's direction keeps it with the rest.
const direction = I18nManager.isRTL ? ({ writingDirection: 'rtl' } as const) : null;

const FIT = { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.6 } as const;

export function ThemedText({
  variant = 'body',
  color = 'textPrimary',
  fit,
  style,
  ...rest
}: ThemedTextProps) {
  const colors = useColors();
  return (
    <Text
      {...(fit ? FIT : null)}
      style={[typeScale[variant], direction, { color: colors[color] }, fit && styles.fit, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Lets the label give way inside its row, so the shrink-to-fit above takes over instead of the row overflowing.
  fit: { flexShrink: 1 },
});
