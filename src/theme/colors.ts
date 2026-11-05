// The customer app speaks the same visual language as the partner dashboard: deep indigo ink, one mint
// accent, cool indigo-tinted neutrals, hairline borders and soft shadows. Boldness lives in the brand colour
// (primary actions, selection) and the mint "live" signal; everything else stays quiet.
export const palette = {
  deepPurple: '#2F2059',
  indigo: '#4B3BA6',
  turquoise: '#39D2C0',
  mint: '#6DCFBF',
  skyBlue: '#009FD0',
  lime: '#DBFA7B',
  ink: '#15112B',
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F6F7F8',
  // Kept for the few call sites that still reach for the old interactive purple.
  brightPurple: '#7C6FF0',
} as const;

const lightColors = {
  brand: palette.deepPurple,
  // Interactive indigo: links, selected states, focus.
  brandAccent: palette.indigo,
  accent: palette.mint,
  accentSecondary: palette.skyBlue,
  accentDecorative: palette.lime,

  // Screens sit on a faintly lavender canvas; cards are white on top of it.
  background: '#F4F3F8',
  // Sunken fills: inputs, chips, image placeholders, segmented tracks.
  backgroundMuted: '#EDECF3',
  surface: palette.white,
  // Floating pills/chips over photos or maps: translucent, so they follow the theme.
  surfaceTranslucent: 'rgba(255, 255, 255, 0.92)',

  textPrimary: palette.ink,
  textSecondary: '#4A4663',
  textTertiary: '#736F8B',
  textInverse: palette.white,
  textOnBrand: palette.white,

  border: '#E4E2EC',
  divider: '#ECEAF2',

  success: '#0F7B6B',
  warning: '#A8680B',
  danger: '#C73E4A',
  info: '#2F6FA8',
  ratingStar: '#E8A317',

  overlay: 'rgba(21, 17, 43, 0.5)',
  overlayLoading: 'rgba(244, 243, 248, 0.6)',
  // Soft tints of the semantic colours: icon wells, status pills.
  brandTint: 'rgba(75, 59, 166, 0.08)',
  brandTintStrong: 'rgba(75, 59, 166, 0.14)',
  successTint: 'rgba(15, 123, 107, 0.10)',
  warningTint: 'rgba(168, 104, 11, 0.12)',
  dangerTint: 'rgba(199, 62, 74, 0.10)',
  neutralTint: 'rgba(74, 70, 99, 0.09)',
  // Mint is reserved for the live signal (open now, happening today).
  mint: palette.mint,
  mintInk: '#0F7B6B',
  mintTint: 'rgba(109, 207, 191, 0.20)',

  // The deep-indigo surface for the one hero card on a screen (next appointment, confirmation). It stays dark in
  // both themes, with white text on it.
  hero: '#2F2059',
  onHero: '#FFFFFF',
  onHeroMuted: 'rgba(255, 255, 255, 0.72)',
  onHeroTint: 'rgba(255, 255, 255, 0.14)',

  tabActive: palette.deepPurple,
  tabInactive: '#9A97AE',

  disabled: '#D6D4DF',
  disabledText: '#9C9AA6',
} as const;

// Same keys as `lightColors`, widened from its `as const` literal types to plain `string`.
type Colors = { [K in keyof typeof lightColors]: string };

// Dark variant: the neutral ramp inverts, the brand inverts to light lavender (as in the dashboard), and the
// semantic colours are lifted so they keep their contrast on dark surfaces.
const darkColors: Colors = {
  brand: '#ECEBFF',
  brandAccent: '#9E8FFF',
  accent: palette.mint,
  accentSecondary: '#4FB4E0',
  accentDecorative: palette.lime,

  background: '#0A0912',
  backgroundMuted: '#181728',
  surface: '#121120',
  surfaceTranslucent: 'rgba(18, 17, 32, 0.92)',

  textPrimary: '#F1F0FA',
  textSecondary: '#B0ACC6',
  textTertiary: '#8583A2',
  textInverse: palette.white,
  textOnBrand: '#1A1238',

  border: '#2A2840',
  divider: '#1F1D33',

  success: '#6FE0CC',
  warning: '#E7B15A',
  danger: '#FF7A85',
  info: '#6FB2E8',
  ratingStar: '#E8A317',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLoading: 'rgba(10, 9, 18, 0.6)',
  brandTint: 'rgba(158, 143, 255, 0.14)',
  brandTintStrong: 'rgba(158, 143, 255, 0.22)',
  successTint: 'rgba(111, 224, 204, 0.14)',
  warningTint: 'rgba(231, 177, 90, 0.16)',
  dangerTint: 'rgba(255, 122, 133, 0.14)',
  neutralTint: 'rgba(176, 172, 198, 0.12)',
  mint: palette.mint,
  mintInk: '#7FE0CF',
  mintTint: 'rgba(109, 207, 191, 0.16)',

  hero: '#2B2150',
  onHero: '#FFFFFF',
  onHeroMuted: 'rgba(255, 255, 255, 0.72)',
  onHeroTint: 'rgba(255, 255, 255, 0.14)',

  tabActive: '#ECEBFF',
  tabInactive: '#6F6D8B',

  disabled: '#2A2840',
  disabledText: '#6B6874',
};

export type { Colors };
export type ColorToken = keyof Colors;

export const colorSchemes = { light: lightColors, dark: darkColors } satisfies Record<
  string,
  Colors
>;

// Static, light-mode export for any call site that reads `colors` outside a component (it cannot react to
// theme changes). Everywhere that renders should prefer the `useColors()` hook from `ThemeProvider`.
export const colors = lightColors;
