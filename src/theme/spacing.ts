export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  // The side margin of every screen: content never sits closer to the edge than this.
  gutter: 20,
} as const;

export type SpacingToken = keyof typeof spacing;
