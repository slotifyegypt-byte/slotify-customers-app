import { Platform } from 'react-native';

// React Native's New Architecture still reads elevation (Android) and the
// shadow* props (iOS) separately — there's no single cross-platform shadow
// primitive yet, so we keep one token set per platform behind the same keys.
function shadow(elevation: number, opacity: number, radius: number, height: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height },
    },
    android: { elevation },
    default: {},
  });
}

export const shadows = {
  none: shadow(0, 0, 0, 0),
  sm: shadow(2, 0.06, 4, 1),
  md: shadow(4, 0.08, 10, 3),
  lg: shadow(8, 0.12, 20, 6),
} as const;

export type ShadowToken = keyof typeof shadows;
