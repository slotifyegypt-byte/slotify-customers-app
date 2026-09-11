// Font families loaded in App.tsx via expo-font + @expo-google-fonts.
// These string literals must match the keys passed to useFonts().

export const fontFamilies = {
  regular:      'PlusJakartaSans-Regular',    // 400
  medium:       'PlusJakartaSans-Medium',     // 500
  semiBold:     'PlusJakartaSans-SemiBold',   // 600
  bold:         'PlusJakartaSans-Bold',       // 700
  arabicRegular:'IBMPlexSansArabic-Regular',  // 400 — Arabic / RTL
  arabicMedium: 'IBMPlexSansArabic-Medium',   // 500 — Arabic / RTL
} as const;

// Font size scale extracted from the design (px values used directly in the HTML).
export const fontSizes = {
  '9':  9,
  '10': 10,
  '11': 11,
  '12': 12,
  '13': 13,
  '14': 14,
  '15': 15,
  '17': 17,
  '18': 18,
  '19': 19,
  '20': 20,
  '22': 22,
  '23': 23,
  '26': 26,
} as const;

// Line-height presets
export const lineHeights = {
  tight:  1.2,
  normal: 1.4,
  relaxed: 1.5,
  loose:  1.6,
} as const;

// Letter-spacing presets (design uses em values; these are approximate pt equivalents)
export const letterSpacings = {
  tight:    -0.3,  // -0.01em at ~14pt
  normal:    0,
  wide:      0.5,  // category labels, uppercase text
  wider:     1.0,  // all-caps section headers
} as const;
