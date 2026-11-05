import { QueryClient } from '@tanstack/react-query';

import { getAvailability, type AvailabilityParams } from '../api/bookingApi';
import { bookingKeys } from '../api/queryKeys';
import type { AvailabilityResponse, AvailabilitySlot, Service } from '../api/schemas';
import { useBookingDraftStore, type BookingDraftEntry } from '../state/bookingDraftStore';

import { recoverFromSlotConflict } from './useSlotConflictRecovery';

jest.mock('../api/bookingApi', () => ({ getAvailability: jest.fn() }));
const mockGetAvailability = getAvailability as jest.MockedFunction<typeof getAvailability>;

const slot = (start: string, employee: string | null): AvailabilitySlot => ({
  start_time: start,
  end_time: start,
  employee_id: employee,
  employee_name: employee,
  capacity_remaining: employee ? null : 2,
  time_slot_str: start,
});

const availability = (
  serviceId: string,
  employees: Record<string, AvailabilitySlot[]>,
): AvailabilityResponse => ({
  store_id: 'branch-1',
  service_id: serviceId,
  date: '2026-11-04',
  timezone: 'Africa/Cairo',
  service_duration_minutes: 45,
  step_minutes: 15,
  price: 300,
  booking_mode: 'specialist',
  employees: Object.entries(employees).map(([id, slots]) => ({
    employee_id: id,
    employee_name: id,
    available_slots: slots,
  })),
  slots: [],
});

const entry = (serviceId: string, start: string, employee: string): BookingDraftEntry => ({
  service: { id: serviceId, name: serviceId, requires_specialist: true } as Service,
  employeeId: null,
  date: '2026-11-04',
  slot: slot(start, employee),
});

const haircut = entry('haircut', '2026-11-04T08:00:00.000Z', 'mona');
const blowDry = entry('blowdry', '2026-11-04T09:00:00.000Z', 'sam');

beforeEach(() => {
  mockGetAvailability.mockReset();
  useBookingDraftStore.setState({ storeId: null, entries: {} });
});

describe('recoverFromSlotConflict', () => {
  it('refetches availability per entry, removes only the conflicting entry from the draft and returns it', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const stale = availability('haircut', { mona: [haircut.slot] });
    queryClient.setQueryData(
      bookingKeys.availability({ store_id: 'branch-1', service_id: 'haircut', date: '2026-11-04' }),
      stale,
    );
    useBookingDraftStore.getState().setEntry('branch-1', haircut);
    useBookingDraftStore.getState().setEntry('branch-1', blowDry);

    mockGetAvailability.mockImplementation(async (params: AvailabilityParams) =>
      params.service_id === 'haircut'
        ? availability('haircut', { mona: [] }) // taken by someone else
        : availability('blowdry', { sam: [blowDry.slot] }),
    );

    const conflicting = await recoverFromSlotConflict(queryClient, 'branch-1', [haircut, blowDry]);

    expect(conflicting).toEqual([haircut]);
    expect(mockGetAvailability).toHaveBeenCalledTimes(2);
    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['blowdry']);
    // The cached grid now holds the fresh data.
    expect(
      queryClient.getQueryData<AvailabilityResponse>(
        bookingKeys.availability({
          store_id: 'branch-1',
          service_id: 'haircut',
          date: '2026-11-04',
        }),
      )?.employees[0].available_slots,
    ).toEqual([]);
  });

  it('removes nothing when a refetch fails, rather than guessing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    useBookingDraftStore.getState().setEntry('branch-1', haircut);
    mockGetAvailability.mockRejectedValue(new Error('offline'));

    await expect(recoverFromSlotConflict(queryClient, 'branch-1', [haircut])).resolves.toEqual([]);
    expect(Object.keys(useBookingDraftStore.getState().entries)).toEqual(['haircut']);
  });
});
