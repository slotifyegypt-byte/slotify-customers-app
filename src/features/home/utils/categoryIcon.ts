import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

// Categories are seeded server-side with free-text names (customer-app-api-map.md
// §2 — no `key`/`icon_url` field), so the icon is derived from the name here
// instead of from data. `pinColor` matches the design mockup's per-category
// map-pin palette (MAPPIN_CAT_COLOR in Design.html). `tint` is a light (~16%)
// wash of `pinColor`, used behind the Ionicons fallback so a category
// without a custom illustration still reads as "colored", not gray.
//
// LIVE-VERIFIED against GET /store-categories/ (2026-09-24): only 5
// categories are actually seeded right now — Automotive, Barbershop, Nails,
// Salon, Spa. car-care/tailor/tire-shops have no live category yet but keep
// their own rules (with real illustrations, now that assets/images has
// distinct, correctly-themed art for each — see below) so whichever gets
// seeded next just works with no code change.
//
// Nails used to fall through to the Salon rule (`/salon|nail|.../`, "nail"
// matching "Nails") and rendered Salon's hairdresser illustration — wrong
// once Nails became its own real category. It has no dedicated illustration
// yet, so it gets its own rule/color and an Ionicons fallback instead of
// borrowing Salon's.
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
    match: /auto|repair|fix|phone|electronic|mechanic/i,
    icon: 'construct-outline',
    image: require('../../../../assets/images/auto-repair.png'),
    imageScale: 1.25,
    pinColor: '#854F0B',
    tint: 'rgba(133, 79, 11, 0.16)',
  },
];

export function iconForCategory(name: string): IoniconName {
  const rule = RULES.find((r) => r.match.test(name));
  return rule?.icon ?? 'grid-outline';
}

export function imageForCategory(name: string): { source: number; scale: number } | null {
  const rule = RULES.find((r) => r.match.test(name));
  return rule?.image ? { source: rule.image, scale: rule.imageScale ?? 1 } : null;
}

export function pinColorForCategory(name: string): string {
  const rule = RULES.find((r) => r.match.test(name));
  return rule?.pinColor ?? colors.brandAccent;
}

export function tintForCategory(name: string): string {
  const rule = RULES.find((r) => r.match.test(name));
  return rule?.tint ?? colors.backgroundMuted;
}
