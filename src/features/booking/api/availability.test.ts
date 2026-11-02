import { isApiError, type ApiError } from '@/lib/api/errors';

import { getAvailability } from './bookingApi';

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

const BRANCH = 'd0000000-0000-4000-8000-000000000001';
const HAIRCUT = 'f2000000-0000-4000-8000-000000000001';
const MONA = 'e0000000-0000-4000-8000-000000000002';
const SAM = 'e0000000-0000-4000-8000-000000000003';

// Shapes copied from a real `GET availability?…&stream=0` against the hosted
// project (Glamour Studio Maadi / Shiny Cars Nasr City, 2026-11-04).
const meta = (overrides: Record<string, unknown> = {}) => ({
  type: 'meta',
  branch_id: BRANCH,
  service_id: HAIRCUT,
  date: '2026-11-04',
  timezone: 'Africa/Cairo',
  duration_minutes: 45,
  booking_mode: 'specialist',
  step_minutes: 15,
  price: '300.00',
  ...overrides,
});

const specialistDoc = (timezone = 'Africa/Cairo') => ({
  meta: meta({ timezone }),
  employees: [
    {
      type: 'employee',
      employee_id: MONA,
      name: 'Mona Hassan',
      slots: [
        { starts_at: '2026-11-04T08:00:00.000Z', ends_at: '2026-11-04T08:45:00.000Z' },
        { starts_at: '2026-11-04T08:15:00.000Z', ends_at: '2026-11-04T09:00:00.000Z' },
      ],
    },
    { type: 'employee', employee_id: SAM, name: 'Sam Adel', slots: [] },
  ],
  slots: [],
});

const capacityDoc = {
  meta: meta({
    branch_id: 'd0000000-0000-4000-8000-000000000003',
    service_id: 'f2000000-0000-4000-8000-000000000006',
    duration_minutes: 30,
    booking_mode: 'capacity',
    price: '150.00',
  }),
  employees: [],
  slots: [
    { starts_at: '2026-11-04T06:00:00.000Z', ends_at: '2026-11-04T06:30:00.000Z', remaining: 4 },
    { starts_at: '2026-11-04T06:15:00.000Z', ends_at: '2026-11-04T06:45:00.000Z', remaining: 1 },
  ],
};

const params = { store_id: BRANCH, service_id: HAIRCUT, date: '2026-11-04' };

describe('getAvailability', () => {
  it('GETs the public availability function as one JSON document with only the apikey', async () => {
    fetchMock.mockResolvedValue(json(specialistDoc()));

    await getAvailability(params);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `https://example.supabase.co/functions/v1/availability?branch_id=${BRANCH}&service_id=${HAIRCUT}&date=2026-11-04&stream=0`,
    );
    expect(init.headers).toEqual({ apikey: 'pub-key' });
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('passes employee_id through when a specialist is picked', async () => {
    fetchMock.mockResolvedValue(json(specialistDoc()));

    await getAvailability({ ...params, employee_id: MONA });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      `https://example.supabase.co/functions/v1/availability?branch_id=${BRANCH}&service_id=${HAIRCUT}&date=2026-11-04&employee_id=${MONA}&stream=0`,
    );
  });

  it('maps a specialist document to employees[].available_slots with times in the branch zone', async () => {
    fetchMock.mockResolvedValue(json(specialistDoc()));

    const result = await getAvailability(params);

    expect(result).toEqual({
      store_id: BRANCH,
      service_id: HAIRCUT,
      date: '2026-11-04',
      timezone: 'Africa/Cairo',
      service_duration_minutes: 45,
      step_minutes: 15,
      price: 300,
      booking_mode: 'specialist',
      employees: [
        {
          employee_id: MONA,
          employee_name: 'Mona Hassan',
          available_slots: [
            {
              start_time: '2026-11-04T08:00:00.000Z',
              end_time: '2026-11-04T08:45:00.000Z',
              employee_id: MONA,
              employee_name: 'Mona Hassan',
              capacity_remaining: null,
              time_slot_str: '10:00 AM', // Cairo is UTC+2 in November
            },
            {
              start_time: '2026-11-04T08:15:00.000Z',
              end_time: '2026-11-04T09:00:00.000Z',
              employee_id: MONA,
              employee_name: 'Mona Hassan',
              capacity_remaining: null,
              time_slot_str: '10:15 AM',
            },
          ],
        },
        { employee_id: SAM, employee_name: 'Sam Adel', available_slots: [] },
      ],
      slots: [],
    });
  });

  it("formats slot labels in the document's timezone, not the phone's", async () => {
    fetchMock.mockResolvedValue(json(specialistDoc('Europe/Warsaw')));

    const result = await getAvailability(params);

    // Same 08:00Z instant: Warsaw is UTC+1 in November.
    expect(result.employees[0].available_slots[0].time_slot_str).toBe('9:00 AM');
  });

  it('maps a capacity document to flat slots with capacity_remaining', async () => {
    fetchMock.mockResolvedValue(json(capacityDoc));

    const result = await getAvailability({ ...params, service_id: capacityDoc.meta.service_id as string });

    expect(result.booking_mode).toBe('capacity');
    expect(result.price).toBe(150);
    expect(result.employees).toEqual([]);
    expect(result.slots).toEqual([
      {
        start_time: '2026-11-04T06:00:00.000Z',
        end_time: '2026-11-04T06:30:00.000Z',
        employee_id: null,
        employee_name: null,
        capacity_remaining: 4,
        time_slot_str: '8:00 AM',
      },
      {
        start_time: '2026-11-04T06:15:00.000Z',
        end_time: '2026-11-04T06:45:00.000Z',
        employee_id: null,
        employee_name: null,
        capacity_remaining: 1,
        time_slot_str: '8:15 AM',
      },
    ]);
  });

  it('throws an ApiError from the 404 body for an unknown or inactive branch', async () => {
    fetchMock.mockResolvedValue(json({ code: 'branch_not_found', message: 'branch_not_found' }, 404));

    const failure: unknown = await getAvailability(params).catch((e) => e);

    expect(isApiError(failure, 'branch_not_found')).toBe(true);
    expect((failure as ApiError).status).toBe(404);
  });

  it('treats a day with no free slots as a valid empty result, not an error', async () => {
    fetchMock.mockResolvedValue(
      json({
        meta: meta(),
        employees: [{ type: 'employee', employee_id: SAM, name: 'Sam Adel', slots: [] }],
        slots: [],
      }),
    );

    const result = await getAvailability(params);

    expect(result.employees).toEqual([{ employee_id: SAM, employee_name: 'Sam Adel', available_slots: [] }]);
    expect(result.slots).toEqual([]);
  });

  it('treats a service nobody can perform (no employees at all) as empty too', async () => {
    fetchMock.mockResolvedValue(json({ meta: meta(), employees: [], slots: [] }));

    await expect(getAvailability(params)).resolves.toMatchObject({ employees: [], slots: [] });
  });
});
