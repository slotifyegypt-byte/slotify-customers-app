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
