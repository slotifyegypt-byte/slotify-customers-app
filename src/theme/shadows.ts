import type { ViewStyle } from 'react-native';

// All shadows use rgba(36,27,78, N) — the ink colour at low opacity —
// matching every box-shadow in the design exactly.
// The `elevation` values approximate the visual weight on Android.

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const shadows: Record<string, Shadow> = {
  // Subtle card lift (most list cards, search bar)
  sm: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // Standard card (venue cards, profile menu rows)
  md: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  // Prominent card (deal tiles, map overlay)
  lg: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 6,
  },
  // Heavy card (next-up card, modals)
  xl: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  // Brand-coloured shadow for primary CTA buttons (purple glow)
  brand: {
    shadowColor: '#7C6FF0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  // Upward shadow for bottom nav and bottom sheets
  bottomSheet: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
  },
  // Explore map pin callout
  callout: {
    shadowColor: '#241B4E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
} as const;
