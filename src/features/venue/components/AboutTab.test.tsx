import { render, screen } from '@testing-library/react-native';

import type { StoreDetail } from '@/features/explore-search/api/schemas';
import { ThemeProvider } from '@/theme';

import type { HoursDay } from '../api/schemas';

import { AboutTab } from './AboutTab';

jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const store = {
  id: 'b1',
  description: null,
  phone: null,
  address: '9 Road 9',
  latitude: 1,
  longitude: 2,
  amenities: [],
} as unknown as StoreDetail;

const week = (overrides: Partial<Record<number, HoursDay['intervals']>>): HoursDay[] =>
  ([1, 2, 3, 4, 5, 6, 7] as const).map((day_of_week) => ({
    day_of_week,
    intervals: overrides[day_of_week] ?? [],
  }));

const renderTab = (
  calendarDays: HoursDay[],
  specialDays = [] as React.ComponentProps<typeof AboutTab>['specialDays'],
) =>
  render(
    <ThemeProvider>
      <AboutTab
        store={store}
        calendarDays={calendarDays}
        specialDays={specialDays}
        photos={[]}
        isLoading={false}
        isError={false}
      />
    </ThemeProvider>,
  );

describe('AboutTab hours', () => {
  it('renders split shifts, past-midnight closings and closed days', async () => {
    await renderTab(
      week({
        1: [
          { opens_at: '09:00:00', closes_at: '13:00:00', crosses_midnight: false },
          { opens_at: '16:00:00', closes_at: '20:00:00', crosses_midnight: false },
        ],
        5: [{ opens_at: '22:00:00', closes_at: '02:00:00', crosses_midnight: true }],
      }),
    );

    expect(screen.getByText('Monday')).toBeOnTheScreen();
    expect(screen.getByText('9:00 AM - 1:00 PM')).toBeOnTheScreen();
    expect(screen.getByText('4:00 PM - 8:00 PM')).toBeOnTheScreen();
    expect(screen.getByText('10:00 PM - 2:00 AM (next day)')).toBeOnTheScreen();
    expect(screen.getAllByText(/^Closed/)).toHaveLength(5);
  });

  it('renders upcoming exceptions with their reason', async () => {
    await renderTab(
      week({ 1: [{ opens_at: '09:00:00', closes_at: '17:00:00', crosses_midnight: false }] }),
      [
        {
          date: '2026-12-25',
          is_closed: true,
          opens_at: null,
          closes_at: null,
          reason: 'Christmas',
        },
        {
          date: '2026-12-31',
          is_closed: false,
          opens_at: '10:00:00',
          closes_at: '14:00:00',
          reason: null,
        },
      ],
    );

    expect(screen.getByText('2026-12-25')).toBeOnTheScreen();
    expect(screen.getByText('Christmas')).toBeOnTheScreen();
    expect(screen.getByText('10:00 AM - 2:00 PM')).toBeOnTheScreen();
  });

  it('shows the not-set-up message when no day has hours', async () => {
    await renderTab(week({}));
    expect(screen.getByText(/Opening hours aren't set up yet/)).toBeOnTheScreen();
  });
});

describe('AboutTab amenities', () => {
  const withAmenities = (amenities: string[]) =>
    render(
      <ThemeProvider>
        <AboutTab
          store={{ ...store, amenities } as unknown as StoreDetail}
          calendarDays={week({})}
          specialDays={[]}
          photos={[]}
          isLoading={false}
          isError={false}
        />
      </ThemeProvider>,
    );

  it('labels every amenity the database can hold, including pet friendly and InstaPay', async () => {
    await withAmenities([
      'parking',
      'card_payments',
      'wheelchair_accessible',
      'wifi',
      'kids_friendly',
      'pet_friendly',
      'instapay',
    ]);

    for (const label of [
      'Parking available',
      'Card payments',
      'Wheelchair accessible',
      'Wi-Fi',
      'Kids friendly',
      'Pet friendly',
      'InstaPay',
    ]) {
      expect(screen.getByText(label)).toBeOnTheScreen();
    }
  });

  it('hides an amenity this app version does not know instead of printing its raw key', async () => {
    await withAmenities(['wifi', 'rooftop_pool']);

    expect(screen.getByText('Wi-Fi')).toBeOnTheScreen();
    expect(screen.queryByText('rooftop_pool')).not.toBeOnTheScreen();
  });

  it('omits the whole section when no amenity is recognised', async () => {
    await withAmenities(['rooftop_pool']);

    expect(screen.queryByText('Amenities')).not.toBeOnTheScreen();
  });
});
