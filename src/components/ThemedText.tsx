import { I18nManager, Text, type TextProps } from 'react-native';

import { typeScale, useColors, type ColorToken, type TypeScaleToken } from '@/theme';

interface ThemedTextProps extends TextProps {
  variant?: TypeScaleToken;
  color?: ColorToken;
}

// A paragraph normally takes the direction of its first letter, so a Latin name ("Omar", "Glamour Studio") inside
// the mirrored Arabic layout stays left-aligned while everything around it is right-aligned. Pinning the paragraph
// to the app's direction keeps it with the rest.
const direction = I18nManager.isRTL ? ({ writingDirection: 'rtl' } as const) : null;

export function ThemedText({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...rest
}: ThemedTextProps) {
  const colors = useColors();
  return (
    <Text style={[typeScale[variant], direction, { color: colors[color] }, style]} {...rest} />
  );
}
