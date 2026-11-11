import { ApiError, fromPostgrest } from '@/lib/api/errors';
import { callFunction } from '@/lib/api/functions';
import { parseOrReport } from '@/lib/api/parse';
import { appConfig } from '@/lib/config';
import { supabase } from '@/lib/supabase';

import { extractJoinCode } from '../lib/joinCode';
import { isAllowedWalletUrl, type WalletCapabilities, type WalletProvider } from '../lib/wallet';


import { CapabilitiesSchema, CardSchema, CardsSchema, LinkSchema, type LoyaltyCard } from './schemas';

/** The signed-in customer's loyalty cards, most recently used first. */
function toCard(c: ReturnType<typeof CardSchema.parse>): LoyaltyCard {
  return {
    id: c.card_id,
    code: c.code,
    businessId: c.business_id,
    businessName: c.business_name,
    logoPath: c.logo_path ?? null,
    programName: c.program_name,
    isActive: c.is_active,
    stamps: c.stamps,
    stampsRequired: c.stamps_required,
    rewardsAvailable: c.rewards_available,
    rewardsRedeemed: c.rewards_redeemed,
    rewardTitle: c.reward_title,
    rewardDescription: c.reward_description ?? null,
    brandColor: c.brand_color,
  };
}

export async function getMyLoyaltyCards(): Promise<LoyaltyCard[]> {
  const { data, error } = await supabase.rpc('get_my_loyalty_cards');
  if (error) throw fromPostgrest(error);
  return parseOrReport(CardsSchema, data ?? [], 'get_my_loyalty_cards').map(toCard);
}

/** Adds the business's card to this customer (0 stamps) from the code on its QR; opening a card they already have is fine too. */
export async function joinLoyaltyProgram(input: string): Promise<LoyaltyCard> {
  const code = extractJoinCode(input);
  // A code that cannot be one is not worth a server call: attempts are rate-limited.
  if (!code) throw new ApiError('invalid_join_code', 400);
  const { data, error } = await supabase.rpc('join_loyalty_program', { p_join_code: code });
  if (error) throw fromPostgrest(error);
  if (data === null) throw new ApiError('invalid_join_code', 404);
  return toCard(parseOrReport(CardSchema, data, 'join_loyalty_program'));
}

/** Which wallets the platform has set up. Any failure means "none": the buttons just stay hidden. */
export async function getWalletCapabilities(): Promise<WalletCapabilities> {
  try {
    const parsed = CapabilitiesSchema.safeParse(await callFunction<unknown>('wallet/capabilities'));
    return parsed.success ? parsed.data : { apple: false, google: false };
  } catch {
    return { apple: false, google: false };
  }
}

/** A link that adds the card to the phone's wallet. Throws if the server answers with anything but the expected kind of link. */
export async function getWalletLink(provider: WalletProvider, cardId: string): Promise<string> {
  const path = provider === 'apple' ? 'wallet/apple/link' : 'wallet/google/save-link';
  const { url } = parseOrReport(LinkSchema, await callFunction<unknown>(path, { method: 'POST', body: { card_id: cardId } }), path);
  if (!isAllowedWalletUrl(provider, url, appConfig.supabaseUrl)) throw new ApiError('invalid_wallet_link', 502);
  return url;
}
