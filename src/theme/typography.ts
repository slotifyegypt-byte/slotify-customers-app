import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';

// Brand guide calls for Montserrat (headers) + Garet (body). Garet isn't a
// free/licensed font here, so Plus Jakarta Sans substitutes for body copy —
// swap `fontFamily.body*` below if a licensed Garet file is added later.
export const fontFamily = {
  headingRegular: 'Montserrat_400Regular',
  headingMedium: 'Montserrat_500Medium',
  headingSemiBold: 'Montserrat_600SemiBold',
  headingBold: 'Montserrat_700Bold',
  bodyRegular: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
} as const;

// Passed to useFonts() in the root layout — keys must match fontFamily values above.
export const fontsToLoad = {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
};

export const typeScale = {
  display: { fontFamily: fontFamily.headingBold, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fontFamily.headingBold, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fontFamily.headingSemiBold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fontFamily.headingSemiBold, fontSize: 17, lineHeight: 22 },
  bodyLarge: { fontFamily: fontFamily.bodyRegular, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.bodyRegular, fontSize: 12, lineHeight: 16 },
  // Semibold sibling of `caption` — compact card titles/prices (store name on
  // a home card, price text) that need more weight than `caption` but are too
  // dense for `bodyMedium`. Added to replace one-off `fontSize: 12` +
  // `fontFamily.bodySemiBold` overrides scattered across Home's cards.
  captionStrong: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16 },
  // Compact semibold text for pills/CTAs/rating badges (e.g. "4.8", "Book
  // again", a date pill) — smaller than `caption`, always semibold in
  // practice.
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 11, lineHeight: 14 },
  // Regular-weight sibling of `label` — secondary micro metadata (distance,
  // muted helper text) that sits next to `label` text and needs to match its
  // size.
  captionSmall: { fontFamily: fontFamily.bodyRegular, fontSize: 11, lineHeight: 14 },
  // Micro uppercase tag/badge/eyebrow text ("NEW", "-20%", "NEXT UP") — always
  // semibold with letter-spacing applied per-usage.
  overline: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, lineHeight: 13 },
  button: { fontFamily: fontFamily.bodySemiBold, fontSize: 15, lineHeight: 20 },
} as const;

export type TypeScaleToken = keyof typeof typeScale;
