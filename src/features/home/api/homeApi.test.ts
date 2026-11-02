import { mockQuery } from '@/test/mockSupabase';

import { getCategories } from './homeApi';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));
jest.mock('@/lib/api/client', () => ({ apiClient: {} }));

describe('getCategories', () => {
  it('reads categories ordered by sort_order and maps them to the view model', async () => {
    const { builder, calls } = mockQuery({
      data: [
        { id: 'c1', slug: 'hair-salon', name: 'Hair salon', icon_path: null },
        { id: 'c2', slug: 'barber', name: 'Barber', icon_path: null },
      ],
      error: null,
    });
    mockFrom.mockReturnValue(builder);

    const categories = await getCategories();

    expect(mockFrom).toHaveBeenCalledWith('categories');
    expect(calls).toContainEqual(['select', ['id, slug, name, icon_path']]);
    expect(calls).toContainEqual(['order', ['sort_order']]);
    expect(categories).toEqual([
      { id: 'c1', slug: 'hair-salon', name: 'Hair salon', description: null },
      { id: 'c2', slug: 'barber', name: 'Barber', description: null },
    ]);
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'nope' } });
    mockFrom.mockReturnValue(builder);
    await expect(getCategories()).rejects.toMatchObject({ code: 'forbidden' });
  });
});
