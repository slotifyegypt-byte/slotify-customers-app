import { orderStepIndex } from './OrderTracker';

const NOW = new Date('2026-11-07T08:00:00Z');
const LATER = '2026-11-07T10:00:00Z';
const EARLIER = '2026-11-07T06:00:00Z';

describe('orderStepIndex', () => {
  it('keeps a confirmed order on "Dropped off" until its start time arrives', () => {
    expect(orderStepIndex('confirmed', LATER, NOW)).toBe(0);
  });

  it('moves a confirmed order to "In progress" once its start time has passed', () => {
    expect(orderStepIndex('confirmed', EARLIER, NOW)).toBe(1);
    expect(orderStepIndex('confirmed', NOW.toISOString(), NOW)).toBe(1);
  });

  it('falls back to "In progress" for a confirmed order with no start time', () => {
    expect(orderStepIndex('confirmed')).toBe(1);
  });

  it('starts a pending order at the first step regardless of time', () => {
    expect(orderStepIndex('pending', EARLIER, NOW)).toBe(0);
    expect(orderStepIndex('pending', LATER, NOW)).toBe(0);
  });

  it('marks every step done once completed, and hides the tracker when cancelled', () => {
    expect(orderStepIndex('completed', EARLIER, NOW)).toBe(4);
    expect(orderStepIndex('cancelled', LATER, NOW)).toBe(-1);
    expect(orderStepIndex('no_show', LATER, NOW)).toBe(-1);
  });
});
