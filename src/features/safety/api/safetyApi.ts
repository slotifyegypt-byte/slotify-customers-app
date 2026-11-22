import { fromPostgrest } from '@/lib/api/errors';
import { supabase } from '@/lib/supabase';

// Blocking (App Store guideline 1.2): a customer can block a business (it can no longer message them, and its
// offers stop) or the person behind a review (their reviews disappear for this customer). Reports go to Slotify
// through Contact us / ReportSheet.

export interface Block {
  id: string;
  kind: 'business' | 'person';
  /** The business's name, or a reviewer's first name. */
  name: string;
  createdAt: string;
  /** A blocked business's branches (empty for a person). */
  branchIds: string[];
}

export async function getMyBlocks(): Promise<Block[]> {
  const { data, error } = await supabase.rpc('get_my_blocks');
  if (error) throw fromPostgrest(error);
  return (data ?? []).map((r) => ({
    id: r.block_id,
    kind: r.kind === 'business' ? 'business' : 'person',
    name: r.name,
    createdAt: r.created_at,
    branchIds: r.branch_ids ?? [],
  }));
}

/** Blocks the business that runs this branch. */
export async function blockBusiness(branchId: string): Promise<void> {
  const { error } = await supabase.rpc('block_business', { p_branch_id: branchId });
  if (error) throw fromPostgrest(error);
}

/** Blocks the person who wrote this review (they stay anonymous to the app). */
export async function blockReviewer(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('block_reviewer', { p_review_id: reviewId });
  if (error) throw fromPostgrest(error);
}

export async function unblock(blockId: string): Promise<void> {
  const { error } = await supabase.rpc('unblock', { p_block_id: blockId });
  if (error) throw fromPostgrest(error);
}
