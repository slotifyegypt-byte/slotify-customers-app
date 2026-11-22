import { blockBusiness, blockReviewer, getMyBlocks, unblock } from './safetyApi';

const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

beforeEach(() => mockRpc.mockReset());

describe('safetyApi', () => {
  it('maps the blocks list', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          block_id: 'b1',
          kind: 'business',
          name: 'Glamour Studio',
          created_at: '2026-11-22T10:00:00Z',
          branch_ids: ['br1'],
        },
        {
          block_id: 'b2',
          kind: 'person',
          name: 'Karim',
          created_at: '2026-11-21T10:00:00Z',
          branch_ids: [],
        },
      ],
      error: null,
    });
    await expect(getMyBlocks()).resolves.toEqual([
      {
        id: 'b1',
        kind: 'business',
        name: 'Glamour Studio',
        createdAt: '2026-11-22T10:00:00Z',
        branchIds: ['br1'],
      },
      { id: 'b2', kind: 'person', name: 'Karim', createdAt: '2026-11-21T10:00:00Z', branchIds: [] },
    ]);
  });

  it('blocks a business by its branch, a reviewer by their review, and unblocks', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    await blockBusiness('br1');
    await blockReviewer('rv1');
    await unblock('b1');
    expect(mockRpc).toHaveBeenNthCalledWith(1, 'block_business', { p_branch_id: 'br1' });
    expect(mockRpc).toHaveBeenNthCalledWith(2, 'block_reviewer', { p_review_id: 'rv1' });
    expect(mockRpc).toHaveBeenNthCalledWith(3, 'unblock', { p_block_id: 'b1' });
  });

  it('surfaces a refusal with its code', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { code: 'PT409', message: 'cannot_block_yourself' },
    });
    await expect(blockReviewer('rv1')).rejects.toMatchObject({
      code: 'cannot_block_yourself',
      status: 409,
    });
  });
});
