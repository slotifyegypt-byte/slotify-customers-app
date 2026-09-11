// Border-radius scale from the design.
// Naming follows the design's intent rather than arbitrary T-shirt sizes.

export const radius = {
  sm:   10,   // small chips, inner elements
  md:   12,   // inputs, small cards, OTP boxes
  lg:   14,   // standard inputs (height 52)
  xl:   16,   // standard cards
  '2xl': 18,  // larger cards, venue rows
  '3xl': 20,  // map sections, booking confirmation blocks
  '4xl': 22,  // profile card groups
  '5xl': 26,  // bottom sheets (top corners)
  full: 999,  // pill buttons, avatars, chips
} as const;
