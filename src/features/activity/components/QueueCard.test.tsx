import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import * as Location from 'expo-location';

import '@/lib/i18n';
import type { BookingRead } from '@/features/booking/api/schemas';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme';

import { QueueCard } from './QueueCard';

jest.mock('@/lib/supabase', () => ({ supabase: { rpc: jest.fn() } }));
jest.mock('@/lib/theme/themePreferenceStore', () => ({
  useThemePreferenceStore: (select: (state: { preference: string }) => unknown) =>
    select({ preference: 'light' }),
}));
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
}));

const rpc = supabase.rpc as jest.Mock;
const permission = Location.requestForegroundPermissionsAsync as jest.Mock;
const position = Location.getCurrentPositionAsync as jest.Mock;

// Tuesday 3 Nov 2026, 17:00–17:45 in Cairo (UTC+2); "now" is 17:05 there.
const NOW = new Date('2026-11-03T15:05:00Z');
const booking = {
  id: 'b1',
  booking_status: 'confirmed',
  timezone: 'Africa/Cairo',
  booking_date: '2026-11-03T15:00:00Z',
  venue_available: true,
  booking_services: [{ booking_end_time: '2026-11-03T15:45:00Z' }],
} as unknown as BookingRead;

let ticket: Record<string, unknown> | null;

beforeEach(() => {
  // Only the clock is fixed; timers stay real so React Query schedules as it does in the app.
  jest.useFakeTimers({
    now: NOW,
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'queueMicrotask',
      'nextTick',
    ],
  });
  ticket = null;
  rpc.mockReset();
  rpc.mockImplementation(async (fn: string) => {
    if (fn === 'get_my_queue_ticket') return { data: ticket ? [ticket] : [], error: null };
    if (fn === 'queue_customer_check_in') {
      ticket = {
        ticket_number: 4,
        status: 'waiting',
        due_at: booking.booking_date,
        employee_name: 'Sami Adel',
        ahead: 2,
      };
      return { data: { id: 't1', number: 4, status: 'waiting' }, error: null };
    }
    return { data: null, error: null };
  });
  permission.mockResolvedValue({ status: 'granted' });
  position.mockResolvedValue({ coords: { latitude: 30.01, longitude: 31.2 } });
});

// Unmount first: the card polls and ticks every half minute, and nothing may carry over into the next test.
afterEach(async () => {
  await cleanup();
  // Drop every query (and its garbage-collection timer) so jest can exit.
  clients.splice(0).forEach((c) => c.clear());
  jest.useRealTimers();
});

const clients: QueryClient[] = [];

async function renderCard(b: BookingRead = booking) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return await render(
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <QueueCard booking={b} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('QueueCard', () => {
  it('checks the customer in from where they are, then shows their place in line', async () => {
    await renderCard();
    fireEvent.press(await screen.findByText("I'm here"));
    expect(await screen.findByText('2 people ahead of you.')).toBeTruthy();
    expect(screen.getByText('Ticket 004')).toBeTruthy();
    expect(rpc).toHaveBeenCalledWith('queue_customer_check_in', {
      p_booking_id: 'b1',
      p_latitude: 30.01,
      p_longitude: 31.2,
    });
  });

  it('says why when the customer is too far from the branch', async () => {
    rpc.mockImplementation(async (fn: string) =>
      fn === 'queue_customer_check_in'
        ? { data: null, error: { code: 'PT409', message: 'too_far', details: 'too_far' } }
        : { data: [], error: null },
    );
    await renderCard();
    fireEvent.press(await screen.findByText("I'm here"));
    expect(await screen.findByText('You need to be at the branch to check in.')).toBeTruthy();
  });

  it('asks for location when it is not allowed, without calling the branch', async () => {
    permission.mockResolvedValue({ status: 'denied' });
    await renderCard();
    fireEvent.press(await screen.findByText("I'm here"));
    expect(
      await screen.findByText("Allow location so we can see you're at the branch."),
    ).toBeTruthy();
    expect(rpc).not.toHaveBeenCalledWith('queue_customer_check_in', expect.anything());
  });

  it('says it is their turn once they are called', async () => {
    ticket = {
      ticket_number: 4,
      status: 'serving',
      due_at: booking.booking_date,
      employee_name: 'Sami Adel',
      ahead: null,
    };
    await renderCard();
    expect(await screen.findByText("It's your turn. Sami is ready for you.")).toBeTruthy();
  });

  it('offers nothing and asks nothing on another day', async () => {
    await renderCard({
      ...booking,
      booking_date: '2026-11-04T15:00:00Z',
      booking_services: [{ booking_end_time: '2026-11-04T15:45:00Z' }],
    } as unknown as BookingRead);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByText("I'm here")).toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });
});
