import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar.json';
import en from './en.json';

export type SupportedLocale = 'en' | 'ar';
export const RTL_LOCALES: SupportedLocale[] = ['ar'];

const deviceLocale = Localization.getLocales()[0]?.languageCode;
const initialLocale: SupportedLocale = deviceLocale === 'ar' ? 'ar' : 'en';

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

/**
 * Switching locale on a language with a different writing direction requires
 * a native reload for RN's layout engine to actually flip — I18nManager's
 * RTL flag only takes effect after restart. Callers must follow this with
 * `Updates.reloadAsync()` (see features/profile/screens/LanguageScreen).
 */
export function setAppLocale(locale: SupportedLocale) {
  const shouldBeRTL = RTL_LOCALES.includes(locale);
  i18n.changeLanguage(locale);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true; // caller should reload the app now
  }
  return false;
}

export default i18n;
