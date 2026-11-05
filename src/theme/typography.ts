import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';

// One family for everything, the same one the partner dashboard uses (Instrument Sans). The `heading*` and
// `body*` names are kept so existing call sites keep working; they now share a family and differ by weight.
export const fontFamily = {
  headingRegular: 'InstrumentSans_400Regular',
  headingMedium: 'InstrumentSans_500Medium',
  headingSemiBold: 'InstrumentSans_600SemiBold',
  headingBold: 'InstrumentSans_700Bold',
  bodyRegular: 'InstrumentSans_400Regular',
  bodyMedium: 'InstrumentSans_500Medium',
  bodySemiBold: 'InstrumentSans_600SemiBold',
} as const;

// Passed to useFonts() in the root layout; keys must match fontFamily values above.
export const fontsToLoad = {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
};

// Sentence case everywhere, tight tracking on large sizes, and a 15px body so reading on a phone is easy.
export const typeScale = {
  display: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1,
  },
  h1: { fontFamily: fontFamily.headingSemiBold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  h2: { fontFamily: fontFamily.headingSemiBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  h3: { fontFamily: fontFamily.headingSemiBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  bodyLarge: { fontFamily: fontFamily.bodyRegular, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fontFamily.bodyRegular, fontSize: 13, lineHeight: 18 },
  // Semibold sibling of `caption`: compact card titles and prices.
  captionStrong: { fontFamily: fontFamily.bodySemiBold, fontSize: 13, lineHeight: 18 },
  // Compact semibold text for pills, rating badges and small CTAs.
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16 },
  // Regular-weight sibling of `label`: secondary micro metadata.
  captionSmall: { fontFamily: fontFamily.bodyRegular, fontSize: 12, lineHeight: 16 },
  // Small tags and badges. Kept as a token for existing call sites; no longer uppercase or letter-spaced.
  overline: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16 },
  button: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
} as const;

export type TypeScaleToken = keyof typeof typeScale;
