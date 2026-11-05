import { isApiError, type ApiError } from '@/lib/api/errors';

import type { BookingDraftEntry } from '../state/bookingDraftStore';
import { getBookingErrorMessage, isSlotConflict } from '../utils/bookingErrors';

import {
  createBooking,
  draftEntryToPayload,
  draftToBookingRequest,
  rescheduleBookingService,
} from './bookingApi';
import type { AvailabilitySlot, Service } from './schemas';

jest.mock('@/lib/config', () => ({
  appConfig: { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'pub-key' },
  isDev: true,
}));
jest.mock('@/lib/sentry', () => ({ Sentry: { captureMessage: jest.fn() } }));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: jest.fn(async () => ({ data: { session: { access_token: 'tok' } } })) },
  },
}));

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const service = (overrides: Partial<Service> = {}): Service => ({
  id: 'svc-haircut',
  name: 'Haircut',
  description: null,
  image: null,
  duration_minutes: 45,
  buffer_minutes: 0,
  price: 300,
  currency: 'EGP',
  requires_specialist: true,
  max_concurrent_bookings: null,
  category: null,
  ...overrides,
});

const slot = (overrides: Partial<AvailabilitySlot> = {}): AvailabilitySlot => ({
  start_time: '2026-11-04T08:00:00.000Z',
  end_time: '2026-11-04T08:45:00.000Z',
  employee_id: 'emp-mona',
  employee_name: 'Mona Hassan',
  capacity_remaining: null,
  time_slot_str: '10:00 AM',
  ...overrides,
});

const haircut: BookingDraftEntry = {
  service: service(),
  employeeId: null, // "Any specialist" — resolved by the tapped slot
  date: '2026-11-04',
  slot: slot(),
  note: 'Short on the sides',
};

const carWash: BookingDraftEntry = {
  service: service({
    id: 'svc-wash',
    name: 'Express wash',
    requires_specialist: false,
    max_concurrent_bookings: 4,
  }),
  employeeId: null,
  date: '2026-11-04',
  slot: slot({
    start_time: '2026-11-04T10:00:00.000Z',
    end_time: '2026-11-04T10:30:00.000Z',
    employee_id: null,
    employee_name: null,
    capacity_remaining: 3,
  }),
  note: 'Black SUV',
};

describe('createBooking', () => {
  it('POSTs branch_id, items and customer_note with both auth headers and returns the new id', async () => {
    fetchMock.mockResolvedValue(
      json({ booking: { id: 'bk-1', status: 'confirmed', items: [] } }, 201),
    );

    const items = [
      { service_id: 'svc-haircut', employee_id: 'emp-mona', starts_at: '2026-11-04T08:00:00.000Z' },
    ];
    await expect(createBooking('branch-1', items, 'Haircut: Short on the sides')).resolves.toEqual({
      id: 'bk-1',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.supabase.co/functions/v1/bookings');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok', apikey: 'pub-key' });
    expect(JSON.parse(init.body)).toEqual({
      branch_id: 'branch-1',
      items,
      customer_note: 'Haircut: Short on the sides',
    });
  });

  it('omits customer_note when there is none', async () => {
    fetchMock.mockResolvedValue(json({ booking: { id: 'bk-2' } }, 201));

    await createBooking('branch-1', [
      { service_id: 'svc-wash', starts_at: '2026-11-04T10:00:00.000Z' },
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('customer_note');
  });

  it('rejects a 409 slot_taken with an ApiError that counts as a slot conflict', async () => {
    fetchMock.mockResolvedValue(
      json(
        { code: 'slot_taken', message: 'Someone just booked this time. Please pick another.' },
        409,
      ),
    );

    const failure: unknown = await createBooking('branch-1', [
      { service_id: 'svc-haircut', employee_id: 'emp-mona', starts_at: '2026-11-04T08:00:00.000Z' },
    ]).catch((e) => e);

    expect(isApiError(failure, 'slot_taken')).toBe(true);
    expect((failure as ApiError).status).toBe(409);
    expect(isSlotConflict(failure)).toBe(true);
    expect(getBookingErrorMessage(failure, 'fallback')).toBe(
      'Someone just booked this time. Please pick another.',
    );
  });
});

describe('draftEntryToPayload', () => {
  it('sends the specialist resolved from the tapped slot and the UTC start as-is', () => {
    expect(draftEntryToPayload(haircut)).toEqual({
      service_id: 'svc-haircut',
      employee_id: 'emp-mona',
      starts_at: '2026-11-04T08:00:00.000Z',
    });
  });

  it('omits employee_id entirely for capacity services', () => {
    const payload = draftEntryToPayload(carWash);
    expect(payload).toEqual({ service_id: 'svc-wash', starts_at: '2026-11-04T10:00:00.000Z' });
    expect(payload).not.toHaveProperty('employee_id');
  });
});

describe('draftToBookingRequest', () => {
  it('joins per-service notes into one customer_note, one "<service>: <note>" line each', () => {
    expect(draftToBookingRequest([haircut, carWash])).toEqual({
      items: [draftEntryToPayload(haircut), draftEntryToPayload(carWash)],
      customerNote: 'Haircut: Short on the sides\nExpress wash: Black SUV',
    });
  });

  it('skips blank notes and leaves customerNote undefined when there are none', () => {
    const request = draftToBookingRequest([
      { ...haircut, note: undefined },
      { ...carWash, note: '   ' },
    ]);
    expect(request.customerNote).toBeUndefined();
    expect(request.items).toHaveLength(2);
  });
});

describe('rescheduleBookingService', () => {
  it('PATCHes the booking item with only the new start time', async () => {
    fetchMock.mockResolvedValue(json({ booking: { id: 'bk-1' } }));

    await expect(
      rescheduleBookingService('item-1', { starts_at: '2026-11-05T09:00:00.000Z' }),
    ).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.supabase.co/functions/v1/bookings/items/item-1');
    expect(init.method).toBe('PATCH');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer tok', apikey: 'pub-key' });
    expect(JSON.parse(init.body)).toEqual({ starts_at: '2026-11-05T09:00:00.000Z' });
  });
});
