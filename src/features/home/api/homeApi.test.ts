import { mockQuery } from '@/test/mockSupabase';

import { getCategories, getHomeOffers } from './homeApi';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://cdn.test/${bucket}/${path}` },
        }),
      }),
    },
  },
}));

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

// A row of the `promoted_offer_cards` view: the offer and its branch card columns, flat.
const offerRow = {
  id: 'o1',
  branch_id: 'branch-1',
  business_id: 'biz-1',
  category_id: 'oc1',
  title: 'Fade + beard',
  description: 'Haircut and beard trim',
  image_path: 'offers/o1.jpg',
  original_price: 300,
  offer_price: 240,
  starts_on: '2026-11-01',
  ends_on: '2026-11-30',
  business_name: 'Warsaw Barbers',
  branch_name: 'Mokotow',
  rating_avg: 4.6,
  currency: 'PLN',
  category_slugs: ['barber'],
  promotion_sort_order: null,
};

describe('getHomeOffers', () => {
  it('reads the promoted deals view, in placement order, and maps rows to the view model', async () => {
    const { builder, calls } = mockQuery({ data: [offerRow], error: null });
    mockFrom.mockReturnValue(builder);

    const offers = await getHomeOffers();

    expect(mockFrom).toHaveBeenCalledWith('promoted_offer_cards');
    const select = calls.find(([method]) => method === 'select');
    expect(String(select?.[1][0])).toContain('business_name');
    expect(calls).toContainEqual(['order', ['promotion_sort_order', { ascending: true, nullsFirst: false }]]);
    expect(offers).toEqual([
      {
        id: 'o1',
        store_id: 'branch-1',
        store_name: 'Warsaw Barbers – Mokotow',
        store_rating: 4.6,
        store_category_slugs: ['barber'],
        title: 'Fade + beard',
        description: 'Haircut and beard trim',
        offer_image: 'https://cdn.test/public-media/offers/o1.jpg',
        original_price: 300,
        discounted_price: 240,
        discount_percentage: 20,
        valid_from: '2026-11-01',
        valid_to: '2026-11-30',
        category_id: 'oc1',
        currency: 'PLN',
      },
    ]);
  });

  it('rounds the discount percentage', async () => {
    const { builder } = mockQuery({
      data: [{ ...offerRow, original_price: 300, offer_price: 200 }],
      error: null,
    });
    mockFrom.mockReturnValue(builder);
    const [offer] = await getHomeOffers();
    expect(offer.discount_percentage).toBe(33);
  });

  it('gives a null discount percentage without throwing when there is no original price', async () => {
    const { builder } = mockQuery({ data: [{ ...offerRow, original_price: null }], error: null });
    mockFrom.mockReturnValue(builder);
    const [offer] = await getHomeOffers();
    expect(offer.discount_percentage).toBeNull();
    expect(offer.original_price).toBeNull();
  });

  it('gives a null discount percentage when there is no offer price', async () => {
    const { builder } = mockQuery({ data: [{ ...offerRow, offer_price: null }], error: null });
    mockFrom.mockReturnValue(builder);
    const [offer] = await getHomeOffers();
    expect(offer.discount_percentage).toBeNull();
    expect(offer.discounted_price).toBeNull();
  });

  it('leaves offer_image null when there is no image path', async () => {
    const { builder } = mockQuery({ data: [{ ...offerRow, image_path: null }], error: null });
    mockFrom.mockReturnValue(builder);
    const [offer] = await getHomeOffers();
    expect(offer.offer_image).toBeNull();
  });

  it('skips offers whose branch is no longer visible', async () => {
    const { builder } = mockQuery({
      data: [{ ...offerRow, id: 'gone', business_name: null }, offerRow],
      error: null,
    });
    mockFrom.mockReturnValue(builder);
    const offers = await getHomeOffers();
    expect(offers.map((o) => o.id)).toEqual(['o1']);
  });

  it('throws an ApiError on failure', async () => {
    const { builder } = mockQuery({ data: null, error: { code: '42501', message: 'nope' } });
    mockFrom.mockReturnValue(builder);
    await expect(getHomeOffers()).rejects.toMatchObject({ code: 'forbidden' });
  });
});
