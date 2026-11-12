import { localizedText } from './localized';

describe('localizedText', () => {
  const names = { ar: 'صالون شعر' };

  it('uses the entry for the language, and the English column for English', () => {
    expect(localizedText('Hair salon', names, 'ar')).toBe('صالون شعر');
    expect(localizedText('Hair salon', names, 'ar-EG')).toBe('صالون شعر');
    expect(localizedText('Hair salon', names, 'en')).toBe('Hair salon');
  });

  it('falls back to English when the backend has nothing usable', () => {
    expect(localizedText('Hair salon', {}, 'ar')).toBe('Hair salon');
    expect(localizedText('Hair salon', { ar: '  ' }, 'ar')).toBe('Hair salon');
    expect(localizedText('Hair salon', null, 'ar')).toBe('Hair salon');
    expect(localizedText('Hair salon', ['ar'], 'ar')).toBe('Hair salon');
  });
});
