import { toBooking, type BookingRow } from './mappers';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/${bucket}/${path}` } }),
      }),
    },
  },
}));

const branch = (overrides: Record<string, unknown> = {}) => ({
  id: 'b1',
  business_id: 'biz1',
  business_name: 'Studio',
  branch_name: 'Maadi',
  address: '1 Nile St',
  amenities: [],
  category_slugs: ['hair'],
  city: 'Cairo',
  country_code: 'EG',
  currency: 'EGP',
  description: null,
  is_open_now: true,
  latitude: 30,
  longitude: 31,
  logo_path: 'logos/b1.png',
  phone: null,
  rating_avg: 4.6,
  rating_count: 12,
  share_slug: null,
  timezone: 'Africa/Cairo',
  ...overrides,
});

const item = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  booking_id: 'bk1',
  branch_id: 'b1',
  business_id: 'biz1',
  service_id: `svc-${id}`,
  service_name: `Service ${id}`,
  employee_id: `emp-${id}`,
  employee_name: `Emp ${id}`,
  price: 100,
  starts_at: '2026-11-10T08:00:00+00:00',
  ends_at: '2026-11-10T08:30:00+00:00',
  blocked_until: '2026-11-10T08:30:00+00:00',
  status: 'confirmed',
  created_at: '2026-11-01T10:00:00+00:00',
  updated_at: '2026-11-01T10:00:00+00:00',
  ...overrides,
});

const row = (overrides: Record<string, unknown> = {}): BookingRow =>
  ({
    id: 'bk1',
    branch_id: 'b1',
    business_id: 'biz1',
    customer_id: 'c1',
    status: 'confirmed',
    total_price: 250,
    currency: 'EGP',
    starts_at: '2026-11-10T08:00:00+00:00',
    ends_at: '2026-11-10T09:00:00+00:00',
    created_at: '2026-11-01T10:00:00+00:00',
    updated_at: '2026-11-01T10:00:00+00:00',
    items: [item('i1'), item('i2', { starts_at: '2026-11-10T08:30:00+00:00', ends_at: '2026-11-10T09:00:00+00:00' })],
    branch: branch(),
    reviews: [],
    ...overrides,
  }) as unknown as BookingRow;

describe('toBooking', () => {
  it('maps items to booking_services with string ids and builds booking_services_str', () => {
    const booking = toBooking(row());

    expect(booking.booking_services.map((s) => s.id)).toEqual(['i1', 'i2']);
    expect(booking.booking_services.every((s) => typeof s.id === 'string')).toBe(true);
    expect(booking.booking_services[0]).toMatchObject({
      booking_id: 'bk1',
      service_id: 'svc-i1',
      service_name: 'Service i1',
      employee_id: 'emp-i1',
      booking_start_time: '2026-11-10T08:00:00+00:00',
      booking_end_time: '2026-11-10T08:30:00+00:00',
      booking_status: 'confirmed',
      total_price: 100,
    });
    expect(booking.booking_services_str).toBe('Service i1, Service i2');
  });

  it('copies the booking and branch fields the screens read', () => {
    const booking = toBooking(row());

    expect(booking).toMatchObject({
      id: 'bk1',
      store_id: 'b1',
      store_name: 'Studio – Maadi',
      store_logo: 'https://cdn.test/public-media/logos/b1.png',
      store_address: '1 Nile St',
      store_rating: 4.6,
      booking_status: 'confirmed',
      total_price: 250,
      currency: 'EGP',
      timezone: 'Africa/Cairo',
      booking_date: '2026-11-10T08:00:00+00:00',
    });
  });

  it('is an appointment when any item has an employee', () => {
    const booking = toBooking(row({ items: [item('i1', { employee_id: null }), item('i2')] }));
    expect(booking.booking_type).toBe('appointment');
  });

  it('is a drop_off when every item has employee_id null', () => {
    const booking = toBooking(row({ items: [item('i1', { employee_id: null }), item('i2', { employee_id: null })] }));
    expect(booking.booking_type).toBe('drop_off');
  });

  it('is not a drop_off when there are no items', () => {
    expect(toBooking(row({ items: [] })).booking_type).toBe('appointment');
  });

  it('keeps a booking at a deactivated branch (branch: null) visible with safe defaults', () => {
    const booking = toBooking(row({ branch: null, currency: 'PLN' }));

    expect(booking).toMatchObject({
      store_id: 'b1',
      store_name: 'Unavailable venue',
      store_logo: null,
      store_address: '',
      store_rating: 0,
      currency: 'PLN',
      timezone: 'Africa/Cairo',
      venue_available: false,
    });
    expect(booking.booking_hour_str).toBe('10:00 AM');
    expect(booking.booking_services_str).toBe('Service i1, Service i2');
  });

  it('flags venue_available when the branch embed is present', () => {
    expect(toBooking(row()).venue_available).toBe(true);
  });

  it('orders items by instant, not by string', () => {
    const booking = toBooking(
      row({
        items: [
          item('late', { starts_at: '2026-11-10T09:00:00+00:00' }),
          item('early', { starts_at: '2026-11-10T10:00:00+02:00' }),
        ],
      }),
    );
    expect(booking.booking_services.map((s) => s.id)).toEqual(['early', 'late']);
  });

  it('has_review is false for an empty reviews array and true for one element', () => {
    expect(toBooking(row({ reviews: [] })).has_review).toBe(false);
    expect(toBooking(row({ reviews: [] })).review_id).toBeNull();
    const reviewed = toBooking(row({ reviews: [{ id: 'r1', rating: 5 }] }));
    expect(reviewed.has_review).toBe(true);
    expect(reviewed.review_id).toBe('r1');
  });

  it('passes no_show through as a status', () => {
    expect(toBooking(row({ status: 'no_show' })).booking_status).toBe('no_show');
  });

  it('formats hour and date in the branch timezone (Warsaw differs from Cairo at the same instant)', () => {
    // 2026-11-10T22:30Z is 00:30 on the 11th in Cairo (UTC+2) but 23:30 on the 10th in Warsaw (UTC+1).
    const startsAt = '2026-11-10T22:30:00+00:00';
    const cairo = toBooking(row({ starts_at: startsAt, branch: branch({ timezone: 'Africa/Cairo' }) }));
    const warsaw = toBooking(row({ starts_at: startsAt, branch: branch({ timezone: 'Europe/Warsaw' }) }));

    expect(cairo.booking_hour_str).toBe('12:30 AM');
    expect(cairo.booking_date_str).toBe('11 Nov. 2026');
    expect(warsaw.booking_hour_str).toBe('11:30 PM');
    expect(warsaw.booking_date_str).toBe('10 Nov. 2026');
    expect(cairo.booking_date_title).not.toBe('');
  });
});
