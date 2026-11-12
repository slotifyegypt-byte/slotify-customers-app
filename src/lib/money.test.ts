import i18n from '@/lib/i18n';

import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats the amount with the given currency', () => {
    expect(formatMoney(300, 'EGP')).toContain('300');
  });

  it('uses the currency it is given, not a hard-coded one', () => {
    const formatted = formatMoney(80, 'PLN');
    expect(formatted).toContain('80');
    expect(formatted).not.toContain('EGP');
  });

  it('does not throw for an unknown currency code', () => {
    expect(formatMoney(5, 'XXX')).toContain('5');
  });
});

describe('formatMoney in the app language', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('writes Arabic currency with Western digits when the app is in Arabic', async () => {
    await i18n.changeLanguage('ar');
    const text = formatMoney(1250, 'EGP');
    expect(text).toContain('1,250');
    expect(text).toMatch(/[؀-ۿ]/); // the currency is written in Arabic
  });

  it('keeps English as it was', async () => {
    expect(formatMoney(1250, 'EGP')).toContain('1,250');
    expect(formatMoney(1250, 'EGP')).toMatch(/EGP/);
  });
});
