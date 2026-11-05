import type { BookingRead, BookingServiceRead } from '@/features/booking/api/schemas';

import { rescheduleAvailabilityParams } from './rescheduleParams';

const booking = { store_id: 'branch-1' } as BookingRead;
const item = (overrides: Partial<BookingServiceRead> = {}) =>
  ({
    id: 'item-1',
    service_id: 'svc-haircut',
    employee_id: 'mona',
    ...overrides,
  }) as BookingServiceRead;

describe('rescheduleAvailabilityParams', () => {
  it('pins the specialist and excludes the item being moved', () => {
    expect(rescheduleAvailabilityParams(booking, item(), '2026-11-05')).toEqual({
      store_id: 'branch-1',
      service_id: 'svc-haircut',
      date: '2026-11-05',
      employee_id: 'mona',
      exclude_item_id: 'item-1',
    });
  });

  it('omits employee_id when the item has no specialist but still excludes the item', () => {
    const params = rescheduleAvailabilityParams(booking, item({ employee_id: null }), '2026-11-05');
    expect(params).not.toHaveProperty('employee_id');
    expect(params.exclude_item_id).toBe('item-1');
  });
});
