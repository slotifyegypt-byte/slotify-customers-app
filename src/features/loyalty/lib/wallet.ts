export type WalletProvider = 'apple' | 'google';
export interface WalletCapabilities {
  apple: boolean;
  google: boolean;
}

/** Which "Add to wallet" buttons to offer: the one that belongs to this phone, and only if the business platform has it set up.
 *  A browser (the design preview) shows both. */
export function availableWallets(caps: WalletCapabilities | undefined, os: string): WalletProvider[] {
  if (!caps) return [];
  if (os === 'ios') return caps.apple ? ['apple'] : [];
  if (os === 'android') return caps.google ? ['google'] : [];
  return [...(caps.apple ? (['apple'] as const) : []), ...(caps.google ? (['google'] as const) : [])];
}

/** The server hands back a link to open. Only open one that points where it should: Google's save page over https,
 *  or this project's own pass download. */
export function isAllowedWalletUrl(provider: WalletProvider, url: string, supabaseUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (provider === 'google') return u.protocol === 'https:' && u.hostname === 'pay.google.com' && u.pathname.startsWith('/gp/v/save/');
  const base = new URL(supabaseUrl);
  return u.origin === base.origin && u.pathname.startsWith('/functions/v1/wallet/apple/download/');
}
