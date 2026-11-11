import { availableWallets, isAllowedWalletUrl } from './wallet';

describe('availableWallets', () => {
  const both = { apple: true, google: true };
  it('shows only the wallet that belongs to the phone', () => {
    expect(availableWallets(both, 'ios')).toEqual(['apple']);
    expect(availableWallets(both, 'android')).toEqual(['google']);
  });
  it('shows nothing a wallet is not set up for', () => {
    expect(availableWallets({ apple: false, google: true }, 'ios')).toEqual([]);
    expect(availableWallets({ apple: true, google: false }, 'android')).toEqual([]);
    expect(availableWallets({ apple: false, google: false }, 'android')).toEqual([]);
  });
  it('shows nothing until the answer is known, and in a browser shows both (design preview only)', () => {
    expect(availableWallets(undefined, 'ios')).toEqual([]);
    expect(availableWallets(both, 'web')).toEqual(['apple', 'google']);
  });
});

describe('isAllowedWalletUrl', () => {
  const base = 'https://abc.supabase.co';
  it('accepts only Google Pay save links and our own pass download', () => {
    expect(isAllowedWalletUrl('google', 'https://pay.google.com/gp/v/save/abc.def.ghi', base)).toBe(true);
    expect(isAllowedWalletUrl('apple', `${base}/functions/v1/wallet/apple/download/1234?exp=1&sig=ab`, base)).toBe(true);
  });
  it('refuses anything else, however convincing', () => {
    expect(isAllowedWalletUrl('google', 'https://pay.google.com.evil.test/gp/v/save/x', base)).toBe(false);
    expect(isAllowedWalletUrl('google', 'http://pay.google.com/gp/v/save/x', base)).toBe(false);
    expect(isAllowedWalletUrl('google', 'https://evil.test/gp/v/save/x', base)).toBe(false);
    expect(isAllowedWalletUrl('apple', 'https://evil.test/functions/v1/wallet/apple/download/1', base)).toBe(false);
    expect(isAllowedWalletUrl('apple', `${base}/functions/v1/other`, base)).toBe(false);
    expect(isAllowedWalletUrl('google', 'javascript:alert(1)', base)).toBe(false);
    expect(isAllowedWalletUrl('apple', 'not a url', base)).toBe(false);
    expect(isAllowedWalletUrl('apple', '', base)).toBe(false);
  });
});
