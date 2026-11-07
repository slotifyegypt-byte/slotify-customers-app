import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic/700Bold';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import * as Font from 'expo-font';
import { Platform } from 'react-native';

import i18n from '@/lib/i18n';

// Switching between English and Arabic flips the layout direction, which restarts the app (see LanguageScreen), so
// the language is fixed for the life of the JS runtime and these can be decided once, when the module loads.
export const isArabicUi = Boolean(i18n.language?.startsWith('ar'));

// One family for everything, the same one the partner dashboard uses (Instrument Sans). The `heading*` and
// `body*` names are kept so existing call sites keep working; they now share a family and differ by weight.
// Instrument Sans has no Arabic letters, so in Arabic the phone would fall back to whatever system font it likes,
// mismatched in weight and shape. IBM Plex Sans Arabic is its grotesque counterpart and carries Latin letters too,
// so a Latin venue name inside an Arabic sentence stays in the same family.
// The fonts are also embedded in the native build (the `expo-font` plugin in app.config.ts), so they exist before any
// JavaScript runs. Without that, a label measured before `useFonts` finishes is measured in the fallback font, the
// narrow width is cached, and the label is later drawn in the brand font and cut off ("Continue with Googl"). Android
// finds an embedded font by its file name, which is the name used below. iOS finds it by the name inside the file
// (its PostScript name), so on iOS that name is used, but only when this build really has the font: an older build, or
// an over-the-air update delivered to one, keeps the runtime-loaded name and behaves as before.
const POSTSCRIPT_NAME: Record<string, string> = {
  InstrumentSans_400Regular: 'InstrumentSans-Regular',
  InstrumentSans_500Medium: 'InstrumentSans-Medium',
  InstrumentSans_600SemiBold: 'InstrumentSans-SemiBold',
  InstrumentSans_700Bold: 'InstrumentSans-Bold',
  IBMPlexSansArabic_400Regular: 'IBMPlexSansArabic-Regular',
  IBMPlexSansArabic_500Medium: 'IBMPlexSansArabic-Medium',
  IBMPlexSansArabic_600SemiBold: 'IBMPlexSansArabic-SemiBold',
  IBMPlexSansArabic_700Bold: 'IBMPlexSansArabic-Bold',
};

export function nativeFontName(alias: string): string {
  if (Platform.OS !== 'ios') return alias;
  const postScript = POSTSCRIPT_NAME[alias];
  try {
    return postScript && Font.isLoaded(postScript) ? postScript : alias;
  } catch {
    return alias;
  }
}

const withNativeNames = <T extends Record<string, string>>(families: T): T =>
  Object.fromEntries(
    Object.entries(families).map(([key, alias]) => [key, nativeFontName(alias)]),
  ) as T;

const latinFamilies = {
  headingRegular: 'InstrumentSans_400Regular',
  headingMedium: 'InstrumentSans_500Medium',
  headingSemiBold: 'InstrumentSans_600SemiBold',
  headingBold: 'InstrumentSans_700Bold',
  bodyRegular: 'InstrumentSans_400Regular',
  bodyMedium: 'InstrumentSans_500Medium',
  bodySemiBold: 'InstrumentSans_600SemiBold',
} as const;

const arabicFamilies = {
  headingRegular: 'IBMPlexSansArabic_400Regular',
  headingMedium: 'IBMPlexSansArabic_500Medium',
  headingSemiBold: 'IBMPlexSansArabic_600SemiBold',
  headingBold: 'IBMPlexSansArabic_700Bold',
  bodyRegular: 'IBMPlexSansArabic_400Regular',
  bodyMedium: 'IBMPlexSansArabic_500Medium',
  bodySemiBold: 'IBMPlexSansArabic_600SemiBold',
} as const;

export const fontFamily: typeof latinFamilies | typeof arabicFamilies = withNativeNames(
  isArabicUi ? arabicFamilies : latinFamilies,
);

// Passed to useFonts() in the root layout; keys must match fontFamily values above. Only the family in use is
// loaded, so an English session doesn't pay for the Arabic files and the other way round.
export const fontsToLoad: Record<string, number> = isArabicUi
  ? {
      IBMPlexSansArabic_400Regular,
      IBMPlexSansArabic_500Medium,
      IBMPlexSansArabic_600SemiBold,
      IBMPlexSansArabic_700Bold,
    }
  : {
      InstrumentSans_400Regular,
      InstrumentSans_500Medium,
      InstrumentSans_600SemiBold,
      InstrumentSans_700Bold,
    };

// Tight tracking suits large Latin headings but breaks Arabic: letters join to their neighbours, and negative
// letter-spacing pulls them apart or on top of each other. Arabic gets none.
const tracking = (value: number): number => (isArabicUi ? 0 : value);

// Sentence case everywhere, tight tracking on large sizes, and a 15px body so reading on a phone is easy.
export const typeScale = {
  display: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: tracking(-1),
  },
  h1: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: tracking(-0.8),
  },
  h2: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: tracking(-0.5),
  },
  h3: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: tracking(-0.2),
  },
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
    letterSpacing: tracking(-0.1),
  },
} as const;

export type TypeScaleToken = keyof typeof typeScale;
