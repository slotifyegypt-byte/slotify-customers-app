import { Text, type TextProps } from 'react-native';

import { typeScale, useColors, type ColorToken, type TypeScaleToken } from '@/theme';

interface ThemedTextProps extends TextProps {
  variant?: TypeScaleToken;
  color?: ColorToken;
}

export function ThemedText({ variant = 'body', color = 'textPrimary', style, ...rest }: ThemedTextProps) {
  const colors = useColors();
  return <Text style={[typeScale[variant], { color: colors[color] }, style]} {...rest} />;
}
