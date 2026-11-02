import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Categories come from the `categories` table, which has no icon data the app
// can use (`icon_path` is unset), so the icon is derived from the category
// `slug` here. `pinColor` matches the design mockup's per-category map-pin
// palette (MAPPIN_CAT_COLOR in Design.html). `tint` is a light (~16%) wash of
// `pinColor`, used behind the Ionicons fallback so a category without a custom
// illustration still reads as "colored", not gray.
//
// Seeded slugs (verified against the hosted project): hair-salon, barber,
// nail-salon, spa, car-care, automotive, tire-shop, vet. Unknown slugs fall
// back to a generic grid icon. The patterns are also loose enough to match a
// display name ("Hair salon", "Barbers"), which unmigrated callers still pass.
//
// Order matters: nail-salon must hit the Nails rule before the Salon rule, and
// car-care before the broader automotive rule. Nails, tire shops and vets have
// no dedicated illustration yet, so they use an Ionicons fallback.
const RULES: { match: RegExp; icon: IoniconName; image?: number; imageScale?: number; pinColor: string; tint: string }[] = [
  {
    match: /barber/i,
    icon: 'cut-outline',
    image: require('../../../../assets/images/barbers.png'),
    imageScale: 1.25,
    pinColor: '#4C6FD1',
    tint: 'rgba(76, 111, 209, 0.16)',
  },
  {
    match: /nail/i,
    icon: 'color-palette-outline',
    pinColor: '#D65C6C',
    tint: 'rgba(214, 92, 108, 0.16)',
  },
  {
    match: /salon|hair|beauty/i,
    icon: 'sparkles-outline',
    image: require('../../../../assets/images/salons.png'),
    imageScale: 1.24,
    pinColor: '#C4517C',
    tint: 'rgba(196, 81, 124, 0.16)',
  },
  {
    match: /spa|massage|wellness/i,
    icon: 'flower-outline',
    image: require('../../../../assets/images/spa.png'),
    imageScale: 1.5,
    pinColor: '#4C41A8',
    tint: 'rgba(76, 65, 168, 0.16)',
  },
  {
    match: /car.?care|car wash|detail/i,
    icon: 'car-outline',
    image: require('../../../../assets/images/car-care.png'),
    imageScale: 1.25,
    pinColor: '#0F6E56',
    tint: 'rgba(15, 110, 86, 0.16)',
  },
  {
    match: /tire|tyre/i,
    icon: 'ellipse-outline',
    image: require('../../../../assets/images/tire-shops.png'),
    imageScale: 1.25,
    pinColor: '#3B4A6B',
    tint: 'rgba(59, 74, 107, 0.16)',
  },
  {
    match: /tailor|cloth|alteration/i,
    icon: 'shirt-outline',
    image: require('../../../../assets/images/tailor.png'),
    imageScale: 1.25,
    pinColor: '#A8511F',
    tint: 'rgba(168, 81, 31, 0.16)',
  },
  {
    match: /vet|animal|pet/i,
    icon: 'paw-outline',
    pinColor: '#2F7D6B',
    tint: 'rgba(47, 125, 107, 0.16)',
  },
  {
    match: /auto|repair|fix|phone|electronic|mechanic/i,
    icon: 'construct-outline',
    image: require('../../../../assets/images/auto-repair.png'),
    imageScale: 1.25,
    pinColor: '#854F0B',
    tint: 'rgba(133, 79, 11, 0.16)',
  },
];

export function iconForCategory(key: string): IoniconName {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.icon ?? 'grid-outline';
}

export function imageForCategory(key: string): { source: number; scale: number } | null {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.image ? { source: rule.image, scale: rule.imageScale ?? 1 } : null;
}

// Only the two rule-less fallbacks depend on the theme (every seeded
// category's own `pinColor`/`tint` is a fixed brand color, unrelated to
// light/dark) — `colors` is passed in by the caller (via `useColors()`)
// rather than read from a module-level import, so this plain function still
// reacts to theme changes.
export function pinColorForCategory(key: string, colors: Colors): string {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.pinColor ?? colors.brandAccent;
}

export function tintForCategory(key: string, colors: Colors): string {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.tint ?? colors.backgroundMuted;
}
