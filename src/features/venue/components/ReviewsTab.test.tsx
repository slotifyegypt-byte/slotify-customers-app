import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react-native';

import '@/lib/i18n';
import { ThemeProvider } from '@/theme';

import type { VenueReview, VenueReviewStats } from '../api/schemas';

import { ReviewsTab } from './ReviewsTab';

jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const review = (id: string, name: string): VenueReview => ({
  id,
  rating: 5,
  comment: `Comment from ${name}`,
  customer_name: name,
  owner_reply: null,
  owner_reply_at: null,
  created_at: '2026-11-01T10:00:00Z',
});

const stats: VenueReviewStats = {
  average_rating: 5,
  total_reviews: 2,
  rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 2 },
};

const renderTab = (ownReviewIds?: ReadonlySet<string>) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <ReviewsTab
          stats={stats}
          timezone="Africa/Cairo"
          reviews={[review('mine', 'Me'), review('theirs', 'Someone')]}
          isLoading={false}
          isError={false}
          canReview={false}
          onWriteReview={() => undefined}
          ownReviewIds={ownReviewIds}
        />
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe('ReviewsTab reporting', () => {
  it("offers Report on other people's reviews but never on your own", async () => {
    await renderTab(new Set(['mine']));
    expect(screen.getAllByRole('button', { name: 'Report' })).toHaveLength(1);
  });

  it('offers no Report at all until the customer’s own reviews are known', async () => {
    // While "my reviews" is still loading the set is undefined: showing Report then would let a customer
    // report (and hide) their own review.
    await renderTab(undefined);
    expect(screen.queryAllByRole('button', { name: 'Report' })).toHaveLength(0);
  });

  it('offers Report on every review once the customer has none of their own', async () => {
    await renderTab(new Set());
    expect(screen.getAllByRole('button', { name: 'Report' })).toHaveLength(2);
  });
});
