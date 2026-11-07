import type { AvailabilitySlot } from '../api/schemas';

import { dayPartOf } from './SlotGrid';

jest.mock('expo-image', () => ({ Image: 'Image' }));

const slot = (time_slot_str: string) => ({ time_slot_str }) as AvailabilitySlot;

describe('dayPartOf', () => {
  it('groups English times by the branch clock', () => {
    expect(dayPartOf(slot('9:00 AM'))).toBe('morning');
    expect(dayPartOf(slot('11:45 AM'))).toBe('morning');
    expect(dayPartOf(slot('12:00 PM'))).toBe('afternoon');
    expect(dayPartOf(slot('4:45 PM'))).toBe('afternoon');
    expect(dayPartOf(slot('5:00 PM'))).toBe('evening');
    expect(dayPartOf(slot('11:30 PM'))).toBe('evening');
  });

  it('treats 12:xx AM as the small hours, a morning', () => {
    expect(dayPartOf(slot('12:15 AM'))).toBe('morning');
  });

  it('groups Arabic times (ص / م) exactly like English ones', () => {
    expect(dayPartOf(slot('9:00 ص'))).toBe('morning');
    expect(dayPartOf(slot('12:00 م'))).toBe('afternoon');
    expect(dayPartOf(slot('4:45 م'))).toBe('afternoon');
    expect(dayPartOf(slot('5:00 م'))).toBe('evening');
    expect(dayPartOf(slot('12:15 ص'))).toBe('morning');
  });

  it('falls back to morning for a label it cannot read', () => {
    expect(dayPartOf(slot('late'))).toBe('morning');
  });
});
