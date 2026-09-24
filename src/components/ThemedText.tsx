import { Text, type TextProps } from 'react-native';

import { colors, typeScale, type ColorToken, type TypeScaleToken } from '@/theme';

interface ThemedTextProps extends TextProps {
  variant?: TypeScaleToken;
  color?: ColorToken;
}

export function ThemedText({ variant = 'body', color = 'textPrimary', style, ...rest }: ThemedTextProps) {
  return <Text style={[typeScale[variant], { color: colors[color] }, style]} {...rest} />;
}
