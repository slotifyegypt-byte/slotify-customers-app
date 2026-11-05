import { notifyManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { ApiError } from '@/lib/api/errors';

import { createBooking, getAvailability } from '../api/bookingApi';
import type { AvailabilityResponse, AvailabilitySlot, Service } from '../api/schemas';
import { useBookingDraftStore, type BookingDraftEntry } from '../state/bookingDraftStore';

import { useConfirmBooking, type ConfirmOutcome } from './useConfirmBooking';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/sentry', () => ({ Sentry: { captureMessage: jest.fn() } }));
jest.mock('../api/bookingApi', () => ({
  ...jest.requireActual('../api/bookingApi'),
  createBooking: jest.fn(),
  getAvailability: jest.fn(),
}));

const mockCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>;
const mockGetAvailability = getAvailability as jest.MockedFunction<typeof getAvailability>;

const slot = (start: string, employee: string): AvailabilitySlot => ({
  start_time: start,
  end_time: start,
  employee_id: employee,
  employee_name: employee,
  capacity_remaining: null,
  time_slot_str: start,
});

const entry = (
  serviceId: string,
  start: string,
  employee: string,
  note?: string,
): BookingDraftEntry => ({
  service: { id: serviceId, name: serviceId, requires_specialist: true } as Service,
  employeeId: null,
  date: '2026-11-04',
  slot: slot(start, employee),
  note,
});

const haircut = entry('Haircut', '2026-11-04T08:00:00.000Z', 'mona', 'Short');
const blowDry = entry('Blow-dry', '2026-11-04T09:00:00.000Z', 'sam');

const availability = (
  serviceId: string,
  slots: Record<string, AvailabilitySlot[]>,
): AvailabilityResponse => ({
  store_id: 'branch-1',
  service_id: serviceId,
  date: '2026-11-04',
  timezone: 'Africa/Cairo',
  service_duration_minutes: 45,
  step_minutes: 15,
  price: 300,
  booking_mode: 'specialist',
  employees: Object.entries(slots).map(([id, s]) => ({
    employee_id: id,
    employee_name: id,
    available_slots: s,
  })),
  slots: [],
});

// Deliver React Query notifications synchronously so state updates land
// inside act() instead of on a later tick.
notifyManager.setScheduler((callback) => callback());

let queryClient: QueryClient;

async function setup() {
  // gcTime Infinity: no garbage-collection timers left running after a test.
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useConfirmBooking('branch-1'), { wrapper });
}

afterEach(() => {
  queryClient?.clear();
});

beforeEach(() => {
  jest.clearAllMocks();
  useBookingDraftStore.setState({ storeId: null, entries: {} });
  useBookingDraftStore.getState().setEntry('branch-1', haircut);
  useBookingDraftStore.getState().setEntry('branch-1', blowDry);
});

describe('useConfirmBooking', () => {
  it('books the whole draft as one request and clears the draft', async () => {
    mockCreateBooking.mockResolvedValue({ id: 'bk-1' });
    const { result } = await setup();

    let outcome: ConfirmOutcome | undefined;
    await act(async () => {
      outcome = await result.current.confirm([haircut, blowDry], 'fallback');
    });

    expect(outcome).toEqual({ status: 'booked', id: 'bk-1' });
    expect(mockCreateBooking).toHaveBeenCalledWith(
      'branch-1',
      [
        { service_id: 'Haircut', employee_id: 'mona', starts_at: '2026-11-04T08:00:00.000Z' },
        { service_id: 'Blow-dry', employee_id: 'sam', starts_at: '2026-11-04T09:00:00.000Z' },
      ],
      'Haircut: Short',
    );
    expect(useBookingDraftStore.getState().entries).toEqual({});
  });

  it('on slot_taken drops only the conflicting entry, keeps the others and settles the spinner', async () => {
    mockCreateBooking.mockRejectedValue(
      new ApiError('slot_taken', 409, 'Someone just booked this time.'),
    );
    mockGetAvailability.mockImplementation(async (params) =>
      params.service_id === 'Haircut'
        ? availability('Haircut', { mona: [] })
        : availability('Blow-dry', { sam: [blowDry.slot] }),
    );
    const { result } = await setup();

    let outcome: ConfirmOutcome | undefined;
    await act(async () => {
      outcome = await result.current.confirm([haircut, blowDry], 'fallback');
    });

    expect(outcome).toEqual({
      status: 'failed',
      message: 'That time for Haircut was just taken — pick another',
      conflicting: [haircut],
    });
    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['Blow-dry']);
    expect(result.current.isPending).toBe(false);
  });

  it('opens the profile screen on customer_profile_required and shows the server message', async () => {
    mockCreateBooking.mockRejectedValue(
      new ApiError('customer_profile_required', 403, 'Complete your profile before booking.'),
    );
    const { result } = await setup();

    let outcome: ConfirmOutcome | undefined;
    await act(async () => {
      outcome = await result.current.confirm([haircut], 'fallback');
    });

    expect(router.push).toHaveBeenCalledWith('/(tabs)/profile/edit');
    expect(outcome).toEqual({
      status: 'failed',
      message: 'Complete your profile before booking.',
      conflicting: null,
    });
    // Nothing removed from the draft for a non-slot error.
    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['Haircut', 'Blow-dry']);
  });

  it("shows the server's message for other booking errors", async () => {
    mockCreateBooking.mockRejectedValue(
      new ApiError('employee_unavailable', 422, 'This person does not offer this service here.'),
    );
    const { result } = await setup();

    let outcome: ConfirmOutcome | undefined;
    await act(async () => {
      outcome = await result.current.confirm([haircut], 'fallback');
    });

    expect(outcome).toMatchObject({
      message: 'This person does not offer this service here.',
      conflicting: null,
    });
    expect(mockGetAvailability).not.toHaveBeenCalled();
  });

  it('refuses more than 10 services before calling the server', async () => {
    const { result } = await setup();
    const many = Array.from({ length: 11 }, (_, i) =>
      entry(`s${i}`, '2026-11-04T08:00:00.000Z', 'mona'),
    );

    let outcome: ConfirmOutcome | undefined;
    await act(async () => {
      outcome = await result.current.confirm(many, 'fallback');
    });

    expect(outcome).toMatchObject({ status: 'failed', conflicting: null });
    expect(mockCreateBooking).not.toHaveBeenCalled();
  });

  it('sends exactly one booking when confirm is called twice synchronously (double tap)', async () => {
    let finish!: (value: { id: string }) => void;
    mockCreateBooking.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    const { result } = await setup();

    let first!: Promise<ConfirmOutcome>;
    let second!: Promise<ConfirmOutcome>;
    await act(async () => {
      first = result.current.confirm([haircut], 'fallback');
      second = result.current.confirm([haircut], 'fallback'); // before the first resolves
      // The mutation calls createBooking a few microtasks later; then let it finish.
      await new Promise((resolve) => setTimeout(resolve, 0));
      finish({ id: 'bk-1' });
      await Promise.all([first, second]);
    });

    expect(mockCreateBooking).toHaveBeenCalledTimes(1);
    await expect(first).resolves.toEqual({ status: 'booked', id: 'bk-1' });
    await expect(second).resolves.toEqual({ status: 'busy' });
  });

  it('releases the guard after a success and after a failure, so a later confirm works', async () => {
    mockCreateBooking
      .mockResolvedValueOnce({ id: 'bk-1' })
      .mockRejectedValueOnce(new ApiError('employee_unavailable', 422, 'Nope.'))
      .mockResolvedValueOnce({ id: 'bk-2' });
    const { result } = await setup();

    const outcomes: ConfirmOutcome[] = [];
    for (let i = 0; i < 3; i += 1) {
      await act(async () => {
        outcomes.push(await result.current.confirm([haircut], 'fallback'));
      });
    }

    expect(mockCreateBooking).toHaveBeenCalledTimes(3);
    expect(outcomes.map((o) => o.status)).toEqual(['booked', 'failed', 'booked']);
  });

  it('stays guarded during slot-conflict recovery', async () => {
    mockCreateBooking.mockRejectedValueOnce(new ApiError('slot_taken', 409, 'Taken.'));
    let finishRecovery!: (value: AvailabilityResponse) => void;
    mockGetAvailability.mockImplementationOnce(
      () => new Promise((resolve) => (finishRecovery = resolve)),
    );
    const { result } = await setup();

    let first!: Promise<ConfirmOutcome>;
    let duringRecovery!: Promise<ConfirmOutcome>;
    await act(async () => {
      first = result.current.confirm([haircut], 'fallback');
      // Let the create call fail and recovery start, then tap again.
      await new Promise((resolve) => setTimeout(resolve, 0));
      duringRecovery = result.current.confirm([haircut], 'fallback');
      finishRecovery(availability('Haircut', { mona: [] }));
      await Promise.all([first, duringRecovery]);
    });

    expect(mockCreateBooking).toHaveBeenCalledTimes(1);
    await expect(duringRecovery).resolves.toEqual({ status: 'busy' });
    await expect(first).resolves.toMatchObject({ status: 'failed', conflicting: [haircut] });
  });
});
