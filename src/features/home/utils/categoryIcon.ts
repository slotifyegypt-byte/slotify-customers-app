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
// nail-salon, spa, car-care, automotive, tire-shop, vet, tailor, dentist,
// dermatologist, doctor, lab-and-imaging, lawyer, makeup-artist,
// pilates-studio, real-estate, therapist, wedding-dress-atelier. Unknown slugs fall
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
    match: /dentist|dental/i,
    icon: 'medkit-outline',
    image: badge(
      'dentist',
      require('../../../../assets/images/categories/dentist-light.png'),
      require('../../../../assets/images/categories/dentist-dark.png'),
    ),
    pinColor: '#1C93A8',
    tint: 'rgba(28, 147, 168, 0.16)',
  },
  {
    match: /dermatolog|skin/i,
    icon: 'water-outline',
    image: badge(
      'dermatologist',
      require('../../../../assets/images/categories/dermatologist-light.png'),
      require('../../../../assets/images/categories/dermatologist-dark.png'),
    ),
    pinColor: '#D0804A',
    tint: 'rgba(208, 128, 74, 0.16)',
  },
  {
    match: /doctor|physician|clinic/i,
    icon: 'medical-outline',
    image: badge(
      'doctor',
      require('../../../../assets/images/categories/doctor-light.png'),
      require('../../../../assets/images/categories/doctor-dark.png'),
    ),
    pinColor: '#3A7BC8',
    tint: 'rgba(58, 123, 200, 0.16)',
  },
  {
    match: /\blab\b|imaging|radiolog/i,
    icon: 'flask-outline',
    image: badge(
      'lab-and-imaging',
      require('../../../../assets/images/categories/lab-and-imaging-light.png'),
      require('../../../../assets/images/categories/lab-and-imaging-dark.png'),
    ),
    pinColor: '#8A5CC2',
    tint: 'rgba(138, 92, 194, 0.16)',
  },
  {
    match: /lawyer|attorney|legal/i,
    icon: 'scale-outline',
    image: badge(
      'lawyer',
      require('../../../../assets/images/categories/lawyer-light.png'),
      require('../../../../assets/images/categories/lawyer-dark.png'),
    ),
    pinColor: '#7A6232',
    tint: 'rgba(122, 98, 50, 0.16)',
  },
  {
    match: /make.?up|cosmetic/i,
    icon: 'brush-outline',
    image: badge(
      'makeup-artist',
      require('../../../../assets/images/categories/makeup-artist-light.png'),
      require('../../../../assets/images/categories/makeup-artist-dark.png'),
    ),
    pinColor: '#C23B6B',
    tint: 'rgba(194, 59, 107, 0.16)',
  },
  {
    match: /pilates|yoga|fitness/i,
    icon: 'barbell-outline',
    image: badge(
      'pilates-studio',
      require('../../../../assets/images/categories/pilates-studio-light.png'),
      require('../../../../assets/images/categories/pilates-studio-dark.png'),
    ),
    pinColor: '#4E9F3D',
    tint: 'rgba(78, 159, 61, 0.16)',
  },
  {
    match: /real.?estate|property/i,
    icon: 'home-outline',
    image: badge(
      'real-estate',
      require('../../../../assets/images/categories/real-estate-light.png'),
      require('../../../../assets/images/categories/real-estate-dark.png'),
    ),
    pinColor: '#2D6A9F',
    tint: 'rgba(45, 106, 159, 0.16)',
  },
  {
    match: /therap|counsel|psycholog/i,
    icon: 'chatbubbles-outline',
    image: badge(
      'therapist',
      require('../../../../assets/images/categories/therapist-light.png'),
      require('../../../../assets/images/categories/therapist-dark.png'),
    ),
    pinColor: '#E08A2E',
    tint: 'rgba(224, 138, 46, 0.16)',
  },
  {
    match: /wedding|bridal|atelier/i,
    icon: 'heart-outline',
    image: badge(
      'wedding-dress-atelier',
      require('../../../../assets/images/categories/wedding-dress-atelier-light.png'),
      require('../../../../assets/images/categories/wedding-dress-atelier-dark.png'),
    ),
    pinColor: '#C48A9C',
    tint: 'rgba(196, 138, 156, 0.16)',
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
