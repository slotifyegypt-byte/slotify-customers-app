import { z } from 'zod';

const num = z.coerce.number();

/** One card as `get_my_loyalty_cards` returns it. */
export const CardSchema = z.object({
  card_id: z.string(),
  code: z.string(),
  business_id: z.string(),
  business_name: z.string(),
  logo_path: z.string().nullish(),
  program_name: z.string(),
  is_active: z.boolean(),
  stamps: num,
  stamps_required: num,
  rewards_available: num,
  rewards_redeemed: num,
  reward_title: z.string(),
  reward_description: z.string().nullish(),
  brand_color: z.string(),
});
export const CardsSchema = z.array(CardSchema);

export const CapabilitiesSchema = z.object({ apple: z.boolean(), google: z.boolean() });
export const LinkSchema = z.object({ url: z.string() });

export interface LoyaltyCard {
  id: string;
  code: string;
  businessId: string;
  businessName: string;
  logoPath: string | null;
  programName: string;
  isActive: boolean;
  stamps: number;
  stampsRequired: number;
  rewardsAvailable: number;
  rewardsRedeemed: number;
  rewardTitle: string;
  rewardDescription: string | null;
  brandColor: string;
}
