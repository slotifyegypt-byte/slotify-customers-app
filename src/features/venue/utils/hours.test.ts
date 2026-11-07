import i18n from '@/lib/i18n';

import { formatClockTime, formatInterval, weekdayName } from './hours';

describe('formatClockTime', () => {
  it('formats 24h wall-clock strings in 12h', () => {
    expect(formatClockTime('09:00:00')).toBe('9:00 AM');
    expect(formatClockTime('13:30:00')).toBe('1:30 PM');
    expect(formatClockTime('00:00:00')).toBe('12:00 AM');
    expect(formatClockTime('12:15')).toBe('12:15 PM');
  });
});

describe('formatInterval', () => {
  it('joins opening and closing time', () => {
    expect(formatInterval('09:00:00', '17:00:00')).toBe('9:00 AM - 5:00 PM');
  });

  it('marks a closing time past midnight', () => {
    expect(formatInterval('22:00:00', '02:00:00')).toBe('10:00 PM - 2:00 AM (next day)');
    expect(formatInterval('10:00:00', '00:00:00')).toBe('10:00 AM - 12:00 AM (next day)');
  });
});

describe('weekdayName', () => {
  it('names ISO weekdays 1 (Monday) to 7 (Sunday)', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(weekdayName)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]);
  });

  it('never returns a key for an out-of-range day', () => {
    expect(weekdayName(0)).toBe('Monday');
    expect(weekdayName(9)).toBe('Monday');
  });
});

describe('in Arabic', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('ar');
  });
  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('uses Arabic weekday names and AM/PM markers', () => {
    expect(weekdayName(1)).toBe('الاثنين');
    expect(weekdayName(7)).toBe('الأحد');
    expect(formatClockTime('09:00:00')).toBe('9:00 ص');
    expect(formatClockTime('13:30:00')).toBe('1:30 م');
  });

  it('marks a closing time past midnight in Arabic', () => {
    expect(formatInterval('22:00:00', '02:00:00')).toBe('10:00 م - 2:00 ص (اليوم التالي)');
  });
});
