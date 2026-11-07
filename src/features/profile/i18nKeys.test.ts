import ar from '@/lib/i18n/ar.json';
import en from '@/lib/i18n/en.json';

const NAMESPACES = [
  'profile',
  'editProfile',
  'appearance',
  'language',
  'notificationSettings',
  'helpFaq',
  'contactUs',
  'notFound',
  'auth',
  'chat',
  'report',
] as const;

describe('profile i18n', () => {
  it.each(NAMESPACES)('%s has the same keys in English and Arabic, none empty', (ns) => {
    const english = en[ns] as Record<string, string>;
    const arabic = ar[ns] as Record<string, string>;
    expect(Object.keys(arabic).sort()).toEqual(Object.keys(english).sort());
    for (const value of [...Object.values(english), ...Object.values(arabic)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
