// Source: Design & Guideline & Map/slotify-brand-guidelines.md
export const palette = {
  deepPurple: '#3A246B',
  turquoise: '#39D2C0',
  skyBlue: '#009FD0',
  lime: '#DBFA7B',
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F6F7F8',
  // Brighter interactive purple from the product mockups (Design.html) —
  // used for highlight surfaces (next-up card, selected states, CTA accents)
  // everywhere the mockups reach for purple. Distinct from `deepPurple`,
  // which the brand guide reserves for dark header/nav surfaces — the
  // mockups don't actually use a dark header on these screens.
  brightPurple: '#7C6FF0',
} as const;

const lightColors = {
  brand: palette.deepPurple,
  brandAccent: palette.brightPurple,
  accent: palette.turquoise,
  accentSecondary: palette.skyBlue,
  accentDecorative: palette.lime,

  background: palette.white,
  backgroundMuted: palette.offWhite,
  surface: palette.white,
  // Translucent `surface`-toned overlay — floating pills/chips over photos
  // or maps, where a fully opaque surface would look too heavy but a plain
  // white with hardcoded opacity would go transparent in dark mode too.
  surfaceTranslucent: 'rgba(255, 255, 255, 0.94)',

  textPrimary: palette.black,
  textSecondary: '#6B6B76',
  textInverse: palette.white,
  textOnBrand: palette.white,

  border: '#E5E4EA',
  divider: '#EFEFF3',

  success: '#2FAF63',
  warning: '#E0A72D',
  danger: '#E24A4A',
  info: palette.skyBlue,
  // Warm gold used specifically for star-rating fills (reviews, venue rating
  // badge) — distinct from `warning`, which is semantically about alerts
  // even though the two happen to sit in the same amber family.
  ratingStar: '#F2A93B',

  overlay: 'rgba(17, 12, 33, 0.5)',
  // A lighter wash than `overlay` — a loading spinner sits on top of it
  // while content underneath (e.g. the map) stays dimly visible, rather
  // than being hidden behind a near-opaque backdrop.
  overlayLoading: 'rgba(255, 255, 255, 0.5)',
  // Light tints of `brandAccent` for soft fills — selected/CTA pills, icon
  // wells — where a flat fill would be too heavy.
  brandTint: 'rgba(124, 111, 240, 0.12)',
  brandTintStrong: 'rgba(124, 111, 240, 0.18)',
  // Light tint of `success`, same formula as `brandTint` — used for the
  // pickup-ready notification icon well (Design.html notifications screen).
  successTint: 'rgba(47, 175, 99, 0.14)',
  // Light tint of `textSecondary`, same formula as `brandTint`/`successTint`
  // — used for the "general" notification icon well now that
  // `notification_type` (customer-app-api-map.md §12 — VERIFIED against the
  // live backend's /openapi.json, 2026-09-20) distinguishes it from
  // booking/pickup notifications instead of falling back to the brand tint.
  neutralTint: 'rgba(107, 107, 118, 0.12)',

  tabActive: palette.brightPurple,
  tabInactive: '#A7A5B3',

  disabled: '#C9C7D1',
  disabledText: '#9C9AA6',
} as const;

// Same keys as `lightColors`, widened from its `as const` literal types to
// plain `string` — otherwise TypeScript would require darkColors' values to
// match lightColors' exact string literals instead of just its shape.
type Colors = { [K in keyof typeof lightColors]: string };

// Dark variant of the same semantic tokens — same keys, same meaning, just
// dark-appropriate values. `brand`/`brandAccent`/the semantic status colors
// (success/warning/danger/info) are kept close to their light values (brand
// identity + status colors should stay recognizable across themes); the
// neutral surface/text/border ramp is what actually inverts.
const darkColors: Colors = {
  brand: palette.deepPurple,
  brandAccent: palette.brightPurple,
  accent: palette.turquoise,
  accentSecondary: palette.skyBlue,
  accentDecorative: palette.lime,

  background: '#121016',
  backgroundMuted: '#1A1720',
  surface: '#1E1B26',
  surfaceTranslucent: 'rgba(30, 27, 38, 0.94)',

  textPrimary: '#F5F4F8',
  textSecondary: '#A7A5B3',
  textInverse: palette.white,
  textOnBrand: palette.white,

  border: '#332F3D',
  divider: '#292532',

  success: '#3FC479',
  warning: '#E9B851',
  danger: '#EB6767',
  info: '#33B2E0',
  ratingStar: '#F2A93B',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLoading: 'rgba(18, 16, 22, 0.55)',
  brandTint: 'rgba(124, 111, 240, 0.18)',
  brandTintStrong: 'rgba(124, 111, 240, 0.26)',
  successTint: 'rgba(63, 196, 121, 0.18)',
  neutralTint: 'rgba(167, 165, 179, 0.14)',

  tabActive: palette.brightPurple,
  tabInactive: '#7A7787',

  disabled: '#3A3742',
  disabledText: '#6B6874',
};

export type { Colors };
export type ColorToken = keyof Colors;

export const colorSchemes = { light: lightColors, dark: darkColors } satisfies Record<string, Colors>;

// Static, light-mode export — kept for any call site that reads `colors`
// directly outside a component (can't react to theme changes). Everywhere
// that renders should prefer the `useColors()` hook from `ThemeProvider`.
export const colors = lightColors;
