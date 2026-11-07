import i18n from '@/lib/i18n';

import { addDaysToDate, branchDateStrip, formatDraftDateLabel } from './dates';

const LATE_NOV_2_UTC = new Date('2026-11-02T23:30:00Z');

describe('branchDateStrip', () => {
  it("starts on the branch's today, not the phone's or UTC's", () => {
    // 23:30Z on 2 Nov is already 00:30 on 3 Nov in Warsaw (UTC+1)…
    const warsaw = branchDateStrip('Europe/Warsaw', 14, LATE_NOV_2_UTC);
    expect(warsaw[0]).toEqual({ value: '2026-11-03', weekday: 'Tue', day: '3' });

    // …but still 2 Nov in New York.
    expect(branchDateStrip('America/New_York', 14, LATE_NOV_2_UTC)[0]).toEqual({
      value: '2026-11-02',
      weekday: 'Mon',
      day: '2',
    });
  });

  it('lists N consecutive branch-local dates', () => {
    const strip = branchDateStrip('Europe/Warsaw', 14, LATE_NOV_2_UTC);
    expect(strip).toHaveLength(14);
    expect(strip[13].value).toBe('2026-11-16');
    expect(strip.map((d) => d.value)).toEqual(
      Array.from({ length: 14 }, (_, i) => addDaysToDate('2026-11-03', i)),
    );
  });
});

describe('addDaysToDate', () => {
  it('rolls over months and years without touching any time zone', () => {
    expect(addDaysToDate('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
    // The day Europe switches clocks back is still exactly one calendar day.
    expect(addDaysToDate('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDaysToDate('2026-10-25', 1)).toBe('2026-10-26');
  });
});

describe('formatDraftDateLabel', () => {
  it('says Today/Tomorrow relative to the branch-local date', () => {
    expect(formatDraftDateLabel('2026-11-03', 'Europe/Warsaw', LATE_NOV_2_UTC)).toBe('Today');
    expect(formatDraftDateLabel('2026-11-04', 'Europe/Warsaw', LATE_NOV_2_UTC)).toBe('Tomorrow');
    expect(formatDraftDateLabel('2026-11-03', 'America/New_York', LATE_NOV_2_UTC)).toBe('Tomorrow');
  });

  it('uses "EEE, MMM d" for any other day', () => {
    expect(formatDraftDateLabel('2026-11-10', 'Europe/Warsaw', LATE_NOV_2_UTC)).toBe('Tue, Nov 10');
  });
});

describe('in Arabic', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('ar');
  });
  afterAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('names the strip days in Arabic', () => {
    const strip = branchDateStrip('Europe/Warsaw', 3, LATE_NOV_2_UTC);
    expect(strip[0].value).toBe('2026-11-03');
    expect(strip[0].weekday).toBe('الثلاثاء');
    expect(strip.map((d) => d.weekday)).not.toContain('Tue');
  });

  it('says اليوم / غدًا relative to the branch-local date', () => {
    expect(formatDraftDateLabel('2026-11-03', 'Europe/Warsaw', LATE_NOV_2_UTC)).toBe('اليوم');
    expect(formatDraftDateLabel('2026-11-04', 'Europe/Warsaw', LATE_NOV_2_UTC)).toBe('غدًا');
  });

  it('writes a later date with an Arabic weekday and month', () => {
    const label = formatDraftDateLabel('2026-11-10', 'Europe/Warsaw', LATE_NOV_2_UTC);
    expect(label).toContain('الثلاثاء');
    expect(label).toContain('نوفمبر');
    expect(label).not.toMatch(/[A-Za-z]/);
  });
});
