import { formatClockTime, formatInterval } from './hours';

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
