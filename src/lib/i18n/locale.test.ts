// The language is decided once, when the module loads, so each scenario loads it afresh.
const load = (opts: {
  stored?: string | null;
  device?: string;
  secureThrows?: boolean;
  rtl?: boolean;
}) => {
  jest.resetModules();
  const setItem = jest.fn();
  const forceRTL = jest.fn();
  const allowRTL = jest.fn();
  jest.doMock('expo-localization', () => ({
    getLocales: () => [{ languageCode: opts.device ?? 'en' }],
  }));
  jest.doMock('expo-secure-store', () => ({
    getItem: () => {
      if (opts.secureThrows) throw new Error('keychain unavailable');
      return opts.stored ?? null;
    },
    setItem,
  }));
  jest.doMock('react-native', () => ({
    Platform: { OS: 'ios' },
    I18nManager: { isRTL: opts.rtl ?? false, forceRTL, allowRTL },
  }));
  let mod!: typeof import('./index');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- a fresh copy per scenario
    mod = require('./index');
  });
  return { mod, setItem, forceRTL, allowRTL };
};

afterEach(() => {
  jest.dontMock('expo-localization');
  jest.dontMock('expo-secure-store');
  jest.dontMock('react-native');
});

describe('app language', () => {
  it('follows the phone when nothing was chosen', () => {
    expect(load({ device: 'ar' }).mod.default.language).toBe('ar');
    expect(load({ device: 'en' }).mod.default.language).toBe('en');
    expect(load({ device: 'fr' }).mod.default.language).toBe('en');
  });

  it('keeps the language the customer chose, even against the phone language', () => {
    expect(load({ stored: 'ar', device: 'en' }).mod.default.language).toBe('ar');
    expect(load({ stored: 'en', device: 'ar' }).mod.default.language).toBe('en');
  });

  it('ignores a stored value it does not recognise', () => {
    expect(load({ stored: 'klingon', device: 'ar' }).mod.default.language).toBe('ar');
  });

  it('falls back to the phone language if the keychain cannot be read', () => {
    expect(load({ secureThrows: true, device: 'ar' }).mod.default.language).toBe('ar');
  });

  it('saves the choice when the language is switched, and asks for a restart when direction flips', () => {
    const { mod, setItem, forceRTL } = load({ device: 'en', rtl: false });
    expect(mod.setAppLocale('ar')).toBe(true);
    expect(setItem).toHaveBeenCalledWith('slotify-locale', 'ar');
    expect(forceRTL).toHaveBeenCalledWith(true);
    expect(mod.default.language).toBe('ar');
  });

  it('needs no restart when the direction does not change', () => {
    const { mod, setItem } = load({ device: 'en', rtl: false });
    expect(mod.setAppLocale('en')).toBe(false);
    expect(setItem).toHaveBeenCalledWith('slotify-locale', 'en');
  });
});

describe('layout direction at startup', () => {
  it('asks for a right-to-left layout when the language in use is Arabic and the layout is not', () => {
    const { forceRTL, allowRTL } = load({ device: 'ar', rtl: false });
    expect(allowRTL).toHaveBeenCalledWith(true);
    expect(forceRTL).toHaveBeenCalledWith(true);
  });

  it('asks for a left-to-right layout when English is chosen but the layout is still right-to-left', () => {
    const { forceRTL } = load({ stored: 'en', device: 'ar', rtl: true });
    expect(forceRTL).toHaveBeenCalledWith(false);
  });

  it('leaves the layout alone when it already matches the language', () => {
    const arabic = load({ device: 'ar', rtl: true });
    expect(arabic.forceRTL).not.toHaveBeenCalled();
    const english = load({ device: 'en', rtl: false });
    expect(english.forceRTL).not.toHaveBeenCalled();
  });
});
