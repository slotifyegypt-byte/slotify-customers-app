// The type scale is decided once, when the module loads (the app restarts when the language changes), so each
// language is tested by loading the module afresh with the app language set.
const load = (language: 'en' | 'ar') => {
  jest.resetModules();
  jest.doMock('@/lib/i18n', () => ({ __esModule: true, default: { language } }));
  let mod!: typeof import('./typography');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh copy per language
    mod = require('./typography');
  });
  return mod;
};

describe('typography in English', () => {
  const { fontFamily, fontsToLoad, typeScale, isArabicUi } = load('en');

  it('uses Instrument Sans and loads only that family', () => {
    expect(isArabicUi).toBe(false);
    expect(fontFamily.bodyRegular).toBe('InstrumentSans_400Regular');
    expect(Object.keys(fontsToLoad).every((name) => name.startsWith('InstrumentSans_'))).toBe(true);
  });

  it('keeps the tight tracking on large headings', () => {
    expect(typeScale.display.letterSpacing).toBe(-1);
    expect(typeScale.h1.letterSpacing).toBe(-0.8);
    expect(typeScale.h3.letterSpacing).toBe(-0.2);
  });
});

describe('typography in Arabic', () => {
  const { fontFamily, fontsToLoad, typeScale, isArabicUi } = load('ar');

  it('uses IBM Plex Sans Arabic and loads only that family', () => {
    expect(isArabicUi).toBe(true);
    expect(fontFamily.headingSemiBold).toBe('IBMPlexSansArabic_600SemiBold');
    expect(Object.keys(fontsToLoad).every((name) => name.startsWith('IBMPlexSansArabic_'))).toBe(
      true,
    );
  });

  it('loads a font file for every family name the type scale refers to', () => {
    for (const style of Object.values(typeScale)) {
      expect(Object.keys(fontsToLoad)).toContain(style.fontFamily);
    }
  });

  it('has no negative letter-spacing, which breaks joined Arabic letters', () => {
    for (const style of Object.values(typeScale)) {
      const spacing = 'letterSpacing' in style ? style.letterSpacing : 0;
      expect(spacing).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('typography font coverage in English', () => {
  it('loads a font file for every family name the type scale refers to', () => {
    const { fontsToLoad, typeScale } = load('en');
    for (const style of Object.values(typeScale)) {
      expect(Object.keys(fontsToLoad)).toContain(style.fontFamily);
    }
  });
});

describe('nativeFontName', () => {
  const loadWith = (os: 'ios' | 'android', embedded: string[], language: 'en' | 'ar' = 'en') => {
    jest.resetModules();
    jest.doMock('@/lib/i18n', () => ({ __esModule: true, default: { language } }));
    jest.doMock('react-native', () => ({ Platform: { OS: os } }));
    jest.doMock('expo-font', () => ({ isLoaded: (name: string) => embedded.includes(name) }));
    let mod!: typeof import('./typography');
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh copy per scenario
      mod = require('./typography');
    });
    return mod;
  };
  afterEach(() => {
    jest.dontMock('react-native');
    jest.dontMock('expo-font');
  });

  it('uses the name embedded in an iOS build', () => {
    const { fontFamily, nativeFontName } = loadWith('ios', ['InstrumentSans-SemiBold']);
    expect(nativeFontName('InstrumentSans_600SemiBold')).toBe('InstrumentSans-SemiBold');
    expect(fontFamily.headingSemiBold).toBe('InstrumentSans-SemiBold');
  });

  it('keeps the runtime-loaded name on an iOS build that lacks the embedded font', () => {
    const { fontFamily } = loadWith('ios', []);
    expect(fontFamily.headingSemiBold).toBe('InstrumentSans_600SemiBold');
    expect(fontFamily.bodyRegular).toBe('InstrumentSans_400Regular');
  });

  it('mixes per font: only the weights the build has switch over', () => {
    const { fontFamily } = loadWith('ios', ['InstrumentSans-Regular']);
    expect(fontFamily.bodyRegular).toBe('InstrumentSans-Regular');
    expect(fontFamily.bodyMedium).toBe('InstrumentSans_500Medium');
  });

  it('always uses the file name on Android, where that is how embedded fonts are found', () => {
    const { fontFamily } = loadWith('android', ['InstrumentSans-SemiBold']);
    expect(fontFamily.headingSemiBold).toBe('InstrumentSans_600SemiBold');
  });

  it('resolves the Arabic family the same way', () => {
    const { fontFamily } = loadWith('ios', ['IBMPlexSansArabic-SemiBold'], 'ar');
    expect(fontFamily.headingSemiBold).toBe('IBMPlexSansArabic-SemiBold');
    expect(fontFamily.bodyRegular).toBe('IBMPlexSansArabic_400Regular');
  });

  it('falls back to the alias if asking the native side throws', () => {
    jest.resetModules();
    jest.doMock('@/lib/i18n', () => ({ __esModule: true, default: { language: 'en' } }));
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.doMock('expo-font', () => ({
      isLoaded: () => {
        throw new Error('native module missing');
      },
    }));
    let mod!: typeof import('./typography');
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh copy per scenario
      mod = require('./typography');
    });
    expect(mod.fontFamily.headingSemiBold).toBe('InstrumentSans_600SemiBold');
  });
});
