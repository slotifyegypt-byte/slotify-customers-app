import i18n from './index';

/**
 * A text the backend keeps in several languages, in the language on screen. `fallback` is the English column;
 * `translations` is the matching `*_i18n` object keyed by language code, e.g. {"ar": "صالون شعر"}. A language the
 * backend has no text for shows the English.
 */
export function localizedText(
  fallback: string,
  translations: unknown,
  language: string = i18n.language ?? 'en',
): string {
  const code = language.split('-')[0];
  if (code && code !== 'en' && translations !== null && typeof translations === 'object' && !Array.isArray(translations)) {
    const text = (translations as Record<string, unknown>)[code];
    if (typeof text === 'string' && text.trim() !== '') return text;
  }
  return fallback;
}
