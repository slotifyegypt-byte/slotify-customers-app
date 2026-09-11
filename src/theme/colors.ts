// Design token sheet — sourced from Slotify Mockups.dc.html and confirmed
// throughout Slotify App.dc.html / Slotify Onboarding.dc.html.

export const colors = {
  // ── Core palette ──────────────────────────────────────────────────────────
  ink: '#241B4E',          // primary text, deep navy-purple
  inkSoft: '#4C41A8',      // secondary headings / softer purple
  brand: '#7C6FF0',        // main accent — CTAs, active states, links
  brandTint: '#E7E4FA',    // brand light tint — chips, tab pills, highlights
  canvas: '#EEEDF8',       // app screen background
  surface: '#FFFFFF',      // card / sheet backgrounds
  surfaceAlt: '#F4F3FA',   // subtle secondary surface (search bar bg, icon bg)
  textMuted: '#8C87A6',    // placeholder / secondary text / labels
  border: '#E3E1EF',       // dividers, input borders

  // ── Semantic / status ─────────────────────────────────────────────────────
  confirmed: {
    bg: '#E1F5EE',
    fg: '#0F6E56',
  },
  inQueue: {
    bg: '#FCEEDC',
    fg: '#854F0B',
  },
  cancelled: {
    bg: '#FBEAF0',
    fg: '#C4517C',
  },

  // ── Notification badge ────────────────────────────────────────────────────
  badge: '#C4517C',

  // ── Category accent pairs (bg / fg) ──────────────────────────────────────
  category: {
    barbers: { bg: '#EEF3FC', fg: '#4C6FD1' },
    salons:  { bg: '#FBEAF0', fg: '#C4517C' },
    spa:     { bg: '#E7E4FA', fg: '#4C41A8' },
    carcare: { bg: '#E1F5EE', fg: '#0F6E56' },
    tailors: { bg: '#FAEDE4', fg: '#A8511F' },
    repair:  { bg: '#FCEEDC', fg: '#854F0B' },
  } as const,

  // ── Misc / utility ────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Outer canvas (desktop / browser preview background — not used in native)
  outerCanvas: '#DCDAE8',
} as const;

export type CategoryKey = keyof typeof colors.category;
