import i18n from '@/lib/i18n';

import { formatRelativeTime } from './formatRelativeTime';

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('formatRelativeTime', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-06T12:00:00'));
  });
  afterAll(() => jest.useRealTimers());

  it('returns nothing for an unreadable date', () => {
    expect(formatRelativeTime('not a date')).toBe('');
  });

  it('says "Just now" for the last minute and for a future timestamp', () => {
    expect(formatRelativeTime(ago(20_000))).toBe('Just now');
    expect(formatRelativeTime(ago(-5 * MIN))).toBe('Just now');
  });

  it('counts minutes, then hours, then days', () => {
    expect(formatRelativeTime(ago(5 * MIN))).toBe('5m ago');
    expect(formatRelativeTime(ago(3 * HOUR))).toBe('3h ago');
    expect(formatRelativeTime(ago(4 * DAY))).toBe('4d ago');
  });

  it('says "Yesterday" for yesterday', () => {
    expect(formatRelativeTime(new Date('2026-11-05T20:00:00').toISOString())).toBe('Yesterday');
  });

  describe('in Arabic', () => {
    beforeAll(async () => {
      await i18n.changeLanguage('ar');
    });
    afterAll(async () => {
      await i18n.changeLanguage('en');
    });

    it('speaks Arabic', () => {
      expect(formatRelativeTime(ago(20_000))).toBe('الآن');
      expect(formatRelativeTime(ago(5 * MIN))).toBe('منذ 5 د');
      expect(formatRelativeTime(ago(3 * HOUR))).toBe('منذ 3 س');
      expect(formatRelativeTime(ago(4 * DAY))).toBe('منذ 4 ي');
      expect(formatRelativeTime(new Date('2026-11-05T20:00:00').toISOString())).toBe('أمس');
    });
  });
});
