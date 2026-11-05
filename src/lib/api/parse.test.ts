import { z } from 'zod';

import { parseOrReport } from './parse';

const mockCaptureMessage = jest.fn();
let mockIsDev = true;

jest.mock('@/lib/config', () => ({
  get isDev() {
    return mockIsDev;
  },
}));
jest.mock('@/lib/sentry', () => ({
  Sentry: { captureMessage: (...args: unknown[]) => mockCaptureMessage(...args) },
}));

const schema = z.object({ id: z.string() });

beforeEach(() => {
  mockCaptureMessage.mockReset();
  mockIsDev = true;
});

describe('parseOrReport', () => {
  it('returns the parsed data when it matches', () => {
    expect(parseOrReport(schema, { id: 'a' }, 'GET thing')).toEqual({ id: 'a' });
  });

  it('throws in dev when the data drifts from the schema', () => {
    expect(() => parseOrReport(schema, { id: 1 }, 'GET thing')).toThrow(
      /\[API contract drift\] GET thing/,
    );
    expect(mockCaptureMessage).not.toHaveBeenCalled();
  });

  it('reports to Sentry and passes the raw data through in production', () => {
    mockIsDev = false;
    const raw = { id: 1 };

    expect(parseOrReport(schema, raw, 'GET thing')).toBe(raw);
    expect(mockCaptureMessage).toHaveBeenCalledWith(
      expect.stringContaining('[API contract drift] GET thing'),
      expect.objectContaining({ level: 'warning', extra: { raw } }),
    );
  });
});
