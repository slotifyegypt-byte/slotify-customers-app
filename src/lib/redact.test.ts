import { redact } from './redact';

describe('redact', () => {
  it('masks email addresses inside strings', () => {
    expect(redact('contact omar.soudy2011@gmail.com now')).toBe('contact [email] now');
  });

  it('masks E.164 phone numbers', () => {
    expect(redact('call +201055500110 today')).toBe('call [phone] today');
  });

  it('masks bearer tokens and JWTs', () => {
    expect(redact('Authorization: Bearer abc.def.ghi')).toBe('Authorization: Bearer [token]');
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2ln';
    expect(redact(`session ${jwt}`)).toBe('session [jwt]');
  });

  it('redacts values under sensitive keys, at any depth', () => {
    const out = redact({
      user: { email: 'a@b.co', id: 'u1' },
      access_token: 'secret-value',
      nested: { refreshToken: 'x', apikey: 'y', password: 'z' },
    }) as { access_token: unknown; nested: unknown; user: unknown };
    expect(out.access_token).toBe('[redacted]');
    expect(out.nested).toEqual({
      refreshToken: '[redacted]',
      apikey: '[redacted]',
      password: '[redacted]',
    });
    expect(out.user).toEqual({ email: '[email]', id: 'u1' });
  });

  it('leaves ids, timestamps and numbers intact', () => {
    const input = {
      id: 'e0000000-0000-4000-8000-000000000008',
      at: '2026-11-03T08:30:00Z',
      total: 1500,
    };
    expect(redact(input)).toEqual(input);
  });

  it('walks arrays and survives circular references', () => {
    const a: Record<string, unknown> = { list: ['x@y.zz', 1] };
    a.self = a;
    const out = redact(a) as { list: unknown; self: unknown };
    expect(out.list).toEqual(['[email]', 1]);
    expect(out.self).toBe('[circular]');
  });

  it('reduces an Error to name and redacted message (no stack with local paths)', () => {
    const out = redact(new Error('failed for a@b.co')) as Record<string, unknown>;
    expect(out).toEqual({ name: 'Error', message: 'failed for [email]' });
  });
});

describe('what redaction must leave alone', () => {
  it('keeps a Sentry release, dist and environment intact', () => {
    const event = {
      release: 'com.slotify.customers@1.0.0+12',
      dist: '12',
      environment: 'production',
    };
    expect(redact(event)).toEqual(event);
  });

  it('does not take a package or version string for an email address', () => {
    expect(redact('com.slotify.customers@1.0.0+12')).toBe('com.slotify.customers@1.0.0+12');
    expect(redact('react-native@0.86.3')).toBe('react-native@0.86.3');
  });

  it('still masks real addresses, including inside a sentence', () => {
    expect(redact('mail omar.soudy@teamwork.com now')).toBe('mail [email] now');
    expect(redact('a+b@sub.example.co.uk')).toBe('[email]');
  });

  it('keeps an object that appears twice and only marks a true cycle', () => {
    const shared = { id: 'abc' };
    expect(redact({ a: shared, b: shared })).toEqual({ a: { id: 'abc' }, b: { id: 'abc' } });
    const loop: Record<string, unknown> = { name: 'x' };
    loop.self = loop;
    expect(redact(loop)).toEqual({ name: 'x', self: '[circular]' });
  });

  it('handles a long string with no "@" quickly', () => {
    const blob = 'a'.repeat(200_000);
    const started = Date.now();
    expect(redact(blob)).toBe(blob);
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
