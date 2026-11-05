import { dayLabel, daysFromToday, longDayLabel, monthHeading } from './dateLabels';

const WORDS = { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' };
// 12 Nov 2026, 09:00 in Cairo (UTC+2, no DST in winter).
const NOW = new Date('2026-11-12T07:00:00Z');
const CAIRO = 'Africa/Cairo';

describe('dayLabel', () => {
  it('names today, tomorrow and yesterday in the branch zone', () => {
    expect(dayLabel('2026-11-12T10:00:00Z', CAIRO, 'en', WORDS, NOW)).toBe('Today');
    expect(dayLabel('2026-11-13T10:00:00Z', CAIRO, 'en', WORDS, NOW)).toBe('Tomorrow');
    expect(dayLabel('2026-11-11T10:00:00Z', CAIRO, 'en', WORDS, NOW)).toBe('Yesterday');
  });

  it('reads the day in the branch zone, not UTC', () => {
    // 22:30 UTC on the 12th is already 00:30 on the 13th in Cairo.
    expect(dayLabel('2026-11-12T22:30:00Z', CAIRO, 'en', WORDS, NOW)).toBe('Tomorrow');
  });

  it('prints a short date otherwise, adding the year only when it differs', () => {
    expect(dayLabel('2026-11-20T10:00:00Z', CAIRO, 'en', WORDS, NOW)).toMatch(/Fri.*20.*Nov/);
    expect(dayLabel('2027-01-05T10:00:00Z', CAIRO, 'en', WORDS, NOW)).toContain('2027');
  });
});

describe('longDayLabel and monthHeading', () => {
  it('spells out the weekday and month', () => {
    expect(longDayLabel('2026-11-12T10:00:00Z', CAIRO, 'en')).toMatch(/Thursday.*12.*November/);
    expect(monthHeading('2026-10-31T10:00:00Z', CAIRO, 'en')).toMatch(/October 2026/);
  });
});

describe('daysFromToday', () => {
  it('counts branch-local calendar days', () => {
    expect(daysFromToday('2026-11-12T20:00:00Z', CAIRO, NOW)).toBe(0);
    expect(daysFromToday('2026-11-15T10:00:00Z', CAIRO, NOW)).toBe(3);
    expect(daysFromToday('2026-11-09T10:00:00Z', CAIRO, NOW)).toBe(-3);
  });
});
