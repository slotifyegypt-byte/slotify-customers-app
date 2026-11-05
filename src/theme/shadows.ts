import { Platform } from 'react-native';

// React Native's New Architecture still reads elevation (Android) and the shadow* props (iOS) separately,
// so there is one token set per platform behind the same keys. Shadows are indigo-tinted and soft: depth
// without a grey smudge. Cards also carry a hairline border, so they hold their edge without a heavy shadow.
function shadow(elevation: number, opacity: number, radius: number, height: number) {
  return Platform.select({
    ios: {
      shadowColor: '#15112B',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height },
    },
    android: { elevation },
    web: { boxShadow: `0 ${height}px ${radius * 1.6}px rgba(21, 17, 43, ${opacity})` },
    default: {},
  });
}

export const shadows = {
  none: shadow(0, 0, 0, 0),
  sm: shadow(1, 0.05, 4, 1),
  md: shadow(3, 0.08, 10, 4),
  lg: shadow(8, 0.14, 18, 10),
} as const;

export type ShadowToken = keyof typeof shadows;
