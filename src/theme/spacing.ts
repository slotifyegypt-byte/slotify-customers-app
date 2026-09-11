// Spacing scale derived from dominant values in the design (multiples of 2–4 px).
// Use these instead of hardcoded numbers throughout the app.

export const spacing = {
  0:  0,
  1:  2,
  2:  4,
  3:  6,
  4:  8,
  5:  10,
  6:  12,
  7:  14,
  8:  16,
  9:  20,
  10: 24,
  11: 28,
  12: 32,
  13: 40,
  14: 48,
  // Semantic aliases for common layout values seen in the design
  headerTop: 58,   // top-padding used on screens with a sticky header (below status bar)
  screenTop: 76,   // deeper top-padding used in some onboarding screens
  screenH:   874,  // design canvas height (reference only, not for runtime layout)
  screenW:   402,  // design canvas width  (reference only)
} as const;
