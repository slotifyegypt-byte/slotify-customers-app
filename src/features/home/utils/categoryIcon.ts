import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Categories come from the `categories` table, which has no icon data the app
// can use (`icon_path` is unset), so the icon is derived from the category
// `slug` here. `pinColor` matches the design mockup's per-category map-pin
// palette (MAPPIN_CAT_COLOR in Design.html). `tint` is a light (~16%) wash of
// `pinColor`, used behind the Ionicons fallback for a category the badges don't cover.
//
// Seeded slugs (verified against the hosted project): hair-salon, barber,
// nail-salon, spa, car-care, automotive, tire-shop, vet. Unknown slugs fall
// back to a generic grid icon. The patterns are also loose enough to match a
// display name ("Hair salon", "Barbers"), which unmigrated callers still pass.
//
// Order matters: nail-salon must hit the Nails rule before the Salon rule, and
// car-care before the broader automotive rule. Every seeded category has a badge;
// the Ionicons are the fallback for an unknown slug.
// A category's badge art: one image per theme (see assets/icon-src/categories.py).
function badge(_key: string, light: number, dark: number) {
  return { light, dark };
}

const RULES: {
  match: RegExp;
  icon: IoniconName;
  image?: { light: number; dark: number };
  pinColor: string;
  tint: string;
}[] = [
  {
    match: /barber/i,
    icon: 'cut-outline',
    image: badge(
      'barber',
      require('../../../../assets/images/categories/barber-light.png'),
      require('../../../../assets/images/categories/barber-dark.png'),
    ),
    pinColor: '#4C6FD1',
    tint: 'rgba(76, 111, 209, 0.16)',
  },
  {
    match: /nail/i,
    icon: 'color-palette-outline',
    image: badge(
      'nail-salon',
      require('../../../../assets/images/categories/nail-salon-light.png'),
      require('../../../../assets/images/categories/nail-salon-dark.png'),
    ),
    pinColor: '#D65C6C',
    tint: 'rgba(214, 92, 108, 0.16)',
  },
  {
    match: /salon|hair|beauty/i,
    icon: 'sparkles-outline',
    image: badge(
      'hair-salon',
      require('../../../../assets/images/categories/hair-salon-light.png'),
      require('../../../../assets/images/categories/hair-salon-dark.png'),
    ),
    pinColor: '#C4517C',
    tint: 'rgba(196, 81, 124, 0.16)',
  },
  {
    match: /spa|massage|wellness/i,
    icon: 'flower-outline',
    image: badge(
      'spa',
      require('../../../../assets/images/categories/spa-light.png'),
      require('../../../../assets/images/categories/spa-dark.png'),
    ),
    pinColor: '#4C41A8',
    tint: 'rgba(76, 65, 168, 0.16)',
  },
  {
    match: /car.?care|car wash|detail/i,
    icon: 'car-outline',
    image: badge(
      'car-care',
      require('../../../../assets/images/categories/car-care-light.png'),
      require('../../../../assets/images/categories/car-care-dark.png'),
    ),
    pinColor: '#0F6E56',
    tint: 'rgba(15, 110, 86, 0.16)',
  },
  {
    match: /tire|tyre/i,
    icon: 'ellipse-outline',
    image: badge(
      'tire-shop',
      require('../../../../assets/images/categories/tire-shop-light.png'),
      require('../../../../assets/images/categories/tire-shop-dark.png'),
    ),
    pinColor: '#3B4A6B',
    tint: 'rgba(59, 74, 107, 0.16)',
  },
  {
    match: /tailor|cloth|alteration/i,
    icon: 'shirt-outline',
    image: badge(
      'tailor',
      require('../../../../assets/images/categories/tailor-light.png'),
      require('../../../../assets/images/categories/tailor-dark.png'),
    ),
    pinColor: '#A8511F',
    tint: 'rgba(168, 81, 31, 0.16)',
  },
  {
    match: /vet|animal|pet/i,
    icon: 'paw-outline',
    image: badge(
      'vet',
      require('../../../../assets/images/categories/vet-light.png'),
      require('../../../../assets/images/categories/vet-dark.png'),
    ),
    pinColor: '#2F7D6B',
    tint: 'rgba(47, 125, 107, 0.16)',
  },
  {
    match: /auto|repair|fix|phone|electronic|mechanic/i,
    icon: 'construct-outline',
    image: badge(
      'automotive',
      require('../../../../assets/images/categories/automotive-light.png'),
      require('../../../../assets/images/categories/automotive-dark.png'),
    ),
    pinColor: '#854F0B',
    tint: 'rgba(133, 79, 11, 0.16)',
  },
];

export function iconForCategory(key: string): IoniconName {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.icon ?? 'grid-outline';
}

export function imageForCategory(
  key: string,
  scheme: 'light' | 'dark' = 'light',
): { source: number } | null {
  const rule = RULES.find((r) => r.match.test(key));
  return rule?.image ? { source: rule.image[scheme] } : null;
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
