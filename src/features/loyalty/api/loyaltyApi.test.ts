import { isApiError } from '@/lib/api/errors';

import { getMyLoyaltyCards, getWalletCapabilities, getWalletLink, joinLoyaltyProgram } from './loyaltyApi';

const mockRpc = jest.fn();
const mockCallFunction = jest.fn();

jest.mock('@/lib/supabase', () => ({ supabase: { rpc: (...args: unknown[]) => mockRpc(...args) } }));
jest.mock('@/lib/api/functions', () => ({ callFunction: (...args: unknown[]) => mockCallFunction(...args) }));
jest.mock('@/lib/config', () => ({
  appConfig: { supabaseUrl: 'https://abc.supabase.co', supabasePublishableKey: 'k' },
  isDev: true,
}));

const RAW = {
  card_id: 'c1',
  code: 'ABCDEFGHJK',
  business_id: 'b1',
  business_name: 'Glow Studio',
  logo_path: 'logos/glow.png',
  program_name: 'Glow Club',
  is_active: true,
  stamps: '3',
  stamps_required: 8,
  rewards_available: 1,
  rewards_redeemed: 0,
  reward_title: 'Free blow-dry',
  reward_description: null,
  brand_color: '#6A58D8',
  version: 4,
  updated_at: '2026-11-09T10:00:00Z',
  customer_name: 'Dana',
};

beforeEach(() => {
  mockRpc.mockReset();
  mockCallFunction.mockReset();
});

describe('getMyLoyaltyCards', () => {
  it('maps the cards and ignores fields the screen does not use', async () => {
    mockRpc.mockResolvedValue({ data: [RAW], error: null });
    expect(await getMyLoyaltyCards()).toEqual([
      {
        id: 'c1',
        code: 'ABCDEFGHJK',
        businessId: 'b1',
        businessName: 'Glow Studio',
        logoPath: 'logos/glow.png',
        programName: 'Glow Club',
        isActive: true,
        stamps: 3,
        stampsRequired: 8,
        rewardsAvailable: 1,
        rewardsRedeemed: 0,
        rewardTitle: 'Free blow-dry',
        rewardDescription: null,
        brandColor: '#6A58D8',
      },
    ]);
    expect(mockRpc).toHaveBeenCalledWith('get_my_loyalty_cards');
  });

  it('a customer with no cards gets an empty list', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });
    expect(await getMyLoyaltyCards()).toEqual([]);
    mockRpc.mockResolvedValue({ data: null, error: null });
    expect(await getMyLoyaltyCards()).toEqual([]);
  });

  it('turns a database error into an ApiError', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'PT401', message: 'not_signed_in', details: 'x' } });
    const error = await getMyLoyaltyCards().catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'not_signed_in', status: 401 });
  });
});

describe('getWalletCapabilities', () => {
  it('reads which wallets are set up', async () => {
    mockCallFunction.mockResolvedValue({ apple: true, google: false });
    expect(await getWalletCapabilities()).toEqual({ apple: true, google: false });
    expect(mockCallFunction).toHaveBeenCalledWith('wallet/capabilities');
  });
  it('treats any failure as "no wallets" so the buttons simply stay hidden', async () => {
    mockCallFunction.mockRejectedValue(new Error('offline'));
    expect(await getWalletCapabilities()).toEqual({ apple: false, google: false });
    mockCallFunction.mockResolvedValue({ unexpected: true });
    expect(await getWalletCapabilities()).toEqual({ apple: false, google: false });
  });
});

describe('getWalletLink', () => {
  it('asks the function for the right provider and returns the link', async () => {
    mockCallFunction.mockResolvedValue({ url: 'https://pay.google.com/gp/v/save/abc.def.ghi' });
    expect(await getWalletLink('google', 'c1')).toBe('https://pay.google.com/gp/v/save/abc.def.ghi');
    expect(mockCallFunction).toHaveBeenCalledWith('wallet/google/save-link', { method: 'POST', body: { card_id: 'c1' } });
    mockCallFunction.mockResolvedValue({ url: 'https://abc.supabase.co/functions/v1/wallet/apple/download/c1?exp=1&sig=ab' });
    await getWalletLink('apple', 'c1');
    expect(mockCallFunction).toHaveBeenLastCalledWith('wallet/apple/link', { method: 'POST', body: { card_id: 'c1' } });
  });

  it('refuses a link that points somewhere unexpected', async () => {
    mockCallFunction.mockResolvedValue({ url: 'https://evil.test/save' });
    await expect(getWalletLink('google', 'c1')).rejects.toMatchObject({ code: 'invalid_wallet_link' });
  });

  it('passes the function\'s own errors through (not configured, not your card)', async () => {
    const { ApiError } = jest.requireActual('@/lib/api/errors');
    mockCallFunction.mockRejectedValue(new ApiError('wallet_not_configured', 503));
    await expect(getWalletLink('apple', 'c1')).rejects.toMatchObject({ code: 'wallet_not_configured', status: 503 });
  });
});

describe('joinLoyaltyProgram', () => {
  it('sends the clean code and returns the new card', async () => {
    mockRpc.mockResolvedValue({ data: { ...RAW, stamps: 0 }, error: null });
    const card = await joinLoyaltyProgram('slotify://loyalty/join/ABCDEFGHJK');
    expect(mockRpc).toHaveBeenCalledWith('join_loyalty_program', { p_join_code: 'ABCDEFGHJK' });
    expect(card).toMatchObject({ id: 'c1', businessName: 'Glow Studio', stamps: 0 });
  });
  it('a code that cannot be one never reaches the server (it would only burn the rate limit)', async () => {
    const error = await joinLoyaltyProgram('hello').catch((e: unknown) => e);
    expect(error).toMatchObject({ code: 'invalid_join_code' });
    expect(mockRpc).not.toHaveBeenCalled();
  });
  it('an unknown code is an invalid_join_code error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    await expect(joinLoyaltyProgram('ABCDEFGHJK')).rejects.toMatchObject({ code: 'invalid_join_code', status: 404 });
  });
  it('keeps the server\'s reason, e.g. a paused program', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'PT409', message: 'program_inactive', details: 'x' } });
    await expect(joinLoyaltyProgram('ABCDEFGHJK')).rejects.toMatchObject({ code: 'program_inactive', status: 409 });
  });
});
