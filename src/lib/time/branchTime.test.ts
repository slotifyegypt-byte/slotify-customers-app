import {
  branchLocalDate,
  branchToday,
  formatDate,
  formatDateTitle,
  formatHour,
} from './branchTime';

const CAIRO = 'Africa/Cairo';
const WARSAW = 'Europe/Warsaw';

describe('formatHour', () => {
  it('applies Cairo summer time (UTC+3)', () => {
    expect(formatHour('2026-07-01T08:00:00Z', CAIRO)).toBe('11:00 AM');
  });

  it('applies Cairo winter time (UTC+2)', () => {
    expect(formatHour('2026-11-02T08:00:00Z', CAIRO)).toBe('10:00 AM');
  });

  it('uses the branch zone, not a Cairo default', () => {
    expect(formatHour('2026-11-02T08:00:00Z', WARSAW)).toBe('9:00 AM');
  });

  it('zero-pads minutes and drops the leading zero on the hour', () => {
    expect(formatHour('2026-11-02T07:05:00Z', CAIRO)).toBe('9:05 AM');
  });

  it('formats midnight as 12:00 AM and noon as 12:00 PM', () => {
    expect(formatHour('2026-11-02T22:00:00Z', CAIRO)).toBe('12:00 AM');
    expect(formatHour('2026-11-02T10:00:00Z', CAIRO)).toBe('12:00 PM');
  });

  it('formats afternoon hours in 12-hour time', () => {
    expect(formatHour('2026-11-02T13:30:00Z', CAIRO)).toBe('3:30 PM');
  });

  it('accepts an offset timestamp as the API returns it', () => {
    expect(formatHour('2026-11-02T08:00:00+00:00', CAIRO)).toBe('10:00 AM');
  });

  it('throws a RangeError for an invalid IANA zone instead of showing a wrong time', () => {
    expect(() => formatHour('2026-11-02T08:00:00Z', 'Not/AZone')).toThrow(RangeError);
  });
});

describe('formatDate', () => {
  it('formats as "DD Mon. YYYY"', () => {
    expect(formatDate('2026-09-25T08:00:00Z', CAIRO)).toBe('25 Sep. 2026');
  });

  it('zero-pads the day', () => {
    expect(formatDate('2026-09-05T08:00:00Z', CAIRO)).toBe('05 Sep. 2026');
  });

  it('uses the branch-local calendar day across the UTC date boundary', () => {
    // 22:30Z is already the next day in Cairo (UTC+2).
    expect(formatDate('2026-11-02T22:30:00Z', CAIRO)).toBe('03 Nov. 2026');
    expect(formatDate('2026-11-02T22:30:00Z', 'UTC')).toBe('02 Nov. 2026');
  });

  it('keeps the legacy "DD Mon. YYYY" output format', () => {
    // Same string the removed fixed-+02:00 helper produced for this instant
    // (winter, when Cairo really is UTC+2).
    expect(formatDate('2026-12-25T08:00:00+00:00', CAIRO)).toBe('25 Dec. 2026');
  });
});

describe('branchLocalDate', () => {
  it('rolls over to the next day when the branch is ahead of UTC', () => {
    expect(branchLocalDate('2026-11-02T22:30:00Z', CAIRO)).toBe('2026-11-03');
  });

  it('stays on the same day when the instant is still before local midnight', () => {
    expect(branchLocalDate('2026-11-02T21:30:00Z', CAIRO)).toBe('2026-11-02');
  });

  it('accepts a Date as well as an ISO string', () => {
    expect(branchLocalDate(new Date('2026-11-02T22:30:00Z'), CAIRO)).toBe('2026-11-03');
  });

  it('handles a zone behind UTC', () => {
    expect(branchLocalDate('2026-11-02T03:00:00Z', 'America/New_York')).toBe('2026-11-01');
  });
});

describe('branchToday', () => {
  it('is the branch-local date of the injected now', () => {
    expect(branchToday(CAIRO, new Date('2026-11-02T22:30:00Z'))).toBe('2026-11-03');
  });

  it('defaults to the real current time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-02T22:30:00Z'));
    try {
      expect(branchToday(CAIRO)).toBe('2026-11-03');
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('formatDateTitle', () => {
  const now = new Date('2026-11-02T10:00:00Z'); // 12:00 on 2 Nov in Cairo

  it('says Tomorrow Morning for tomorrow before noon', () => {
    expect(formatDateTitle('2026-11-03T06:00:00Z', CAIRO, now)).toBe('Tomorrow Morning');
  });

  it('says Tomorrow Afternoon for tomorrow from noon', () => {
    expect(formatDateTitle('2026-11-03T10:00:00Z', CAIRO, now)).toBe('Tomorrow Afternoon');
  });

  it('says Today Morning / Today Afternoon for the same local day', () => {
    expect(formatDateTitle('2026-11-02T07:00:00Z', CAIRO, now)).toBe('Today Morning');
    expect(formatDateTitle('2026-11-02T15:00:00Z', CAIRO, now)).toBe('Today Afternoon');
  });

  it('counts days ahead from local dates', () => {
    expect(formatDateTitle('2026-11-05T08:00:00Z', CAIRO, now)).toBe('In 3 days');
  });

  it('counts days behind from local dates', () => {
    expect(formatDateTitle('2026-10-31T08:00:00Z', CAIRO, now)).toBe('2 days ago');
  });

  it('treats a booking just after local midnight as tomorrow even though UTC says today', () => {
    // 22:30Z on 2 Nov is 00:30 on 3 Nov in Cairo: same UTC day as `now`,
    // next local day.
    expect(formatDateTitle('2026-11-02T22:30:00Z', CAIRO, now)).toBe('Tomorrow Morning');
  });

  it('measures "today" in the branch zone, not the UTC date', () => {
    // 22:30Z is already 3 Nov in Cairo, so a 3 Nov 08:00Z booking is Today.
    const lateNow = new Date('2026-11-02T22:30:00Z');
    expect(formatDateTitle('2026-11-03T08:00:00Z', CAIRO, lateNow)).toBe('Today Morning');
  });

  it('gives the right day count across the autumn DST change', () => {
    // Cairo leaves DST on 2026-10-30 (last Friday of October). Day differences
    // come from local dates, so a 23/25-hour day cannot skew the count.
    const before = new Date('2026-10-28T10:00:00Z');
    expect(formatDateTitle('2026-11-02T10:00:00Z', CAIRO, before)).toBe('In 5 days');
  });

  it('defaults now to the real current time', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-02T10:00:00Z'));
    try {
      expect(formatDateTitle('2026-11-03T06:00:00Z', CAIRO)).toBe('Tomorrow Morning');
    } finally {
      jest.useRealTimers();
    }
  });
});
