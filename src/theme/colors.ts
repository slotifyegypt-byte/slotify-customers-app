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

export const colors = {
  brand: palette.deepPurple,
  brandAccent: palette.brightPurple,
  accent: palette.turquoise,
  accentSecondary: palette.skyBlue,
  accentDecorative: palette.lime,

  background: palette.white,
  backgroundMuted: palette.offWhite,
  surface: palette.white,

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

export type ColorToken = keyof typeof colors;
