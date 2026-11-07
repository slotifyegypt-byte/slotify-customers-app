import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import i18n, { changeLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager, Platform } from 'react-native';

import ar from './ar.json';
import en from './en.json';

export type SupportedLocale = 'en' | 'ar';
export const RTL_LOCALES: SupportedLocale[] = ['ar'];

const LOCALE_KEY = 'slotify-locale';

// The language the customer picked in Profile > Language. It has to be read synchronously, before i18next starts, so
// the very first render is already in the right language (and the right fonts, which are chosen once at load).
function readStoredLocale(): SupportedLocale | null {
  try {
    const value =
      Platform.OS === 'web'
        ? typeof window === 'undefined'
          ? null
          : window.localStorage.getItem(LOCALE_KEY)
        : SecureStore.getItem(LOCALE_KEY);
    return value === 'ar' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

function storeLocale(locale: SupportedLocale) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(LOCALE_KEY, locale);
    } else {
      SecureStore.setItem(LOCALE_KEY, locale);
    }
  } catch {
    // Not being able to remember the choice must not stop the switch itself.
  }
}

const deviceLocale = Localization.getLocales()[0]?.languageCode;
// A saved choice wins; otherwise follow the phone's language.
const initialLocale: SupportedLocale = readStoredLocale() ?? (deviceLocale === 'ar' ? 'ar' : 'en');

// `use` here is i18next's plugin registration, not a React hook, and not worth a named import (the hooks rule
// would take it for one).
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

// The layout direction is kept natively and only takes effect on the next launch. If it disagrees with the language
// in use (e.g. Arabic was chosen on a phone whose last session was left-to-right), fix it now so the next launch is
// consistent. The first session after such a change can still be mismatched; the in-app switch restarts for that.
if (I18nManager.isRTL !== RTL_LOCALES.includes(initialLocale)) {
  I18nManager.allowRTL(RTL_LOCALES.includes(initialLocale));
  I18nManager.forceRTL(RTL_LOCALES.includes(initialLocale));
}

/**
 * Switching locale on a language with a different writing direction requires
 * a native reload for RN's layout engine to actually flip — I18nManager's
 * RTL flag only takes effect after restart. Callers must follow this with
 * `Updates.reloadAsync()` (see features/profile/screens/LanguageScreen).
 */
export function setAppLocale(locale: SupportedLocale) {
  const shouldBeRTL = RTL_LOCALES.includes(locale);
  storeLocale(locale);
  changeLanguage(locale);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true; // caller should reload the app now
  }
  return false;
}

export default i18n;
