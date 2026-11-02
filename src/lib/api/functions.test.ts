import { isApiError, type ApiError } from './errors';
import { callFunction, callPublicFunction } from './functions';

jest.mock('@/lib/config', () => ({
  appConfig: { supabaseUrl: 'https://example.supabase.co', supabasePublishableKey: 'pub-key' },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: jest.fn(async () => ({ data: { session: { access_token: 'tok' } } })) },
  },
}));

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('callFunction', () => {
  it('sends the session token, the apikey and a JSON body', async () => {
    fetchMock.mockResolvedValue(json({ ok: true }));

    await expect(callFunction('bookings', { method: 'POST', body: { a: 1 } })).resolves.toEqual({
      ok: true,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.supabase.co/functions/v1/bookings');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer tok',
      apikey: 'pub-key',
      'Content-Type': 'application/json',
    });
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it('defaults to GET with no body', async () => {
    fetchMock.mockResolvedValue(json({ id: 'me' }));
    await callFunction('account/me');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
  });

  it('throws an ApiError carrying the body code on a non-2xx response', async () => {
    fetchMock.mockResolvedValue(json({ code: 'slot_taken', message: 'Someone booked it' }, 409));

    const failure: unknown = await callFunction('bookings', { method: 'POST', body: {} }).catch(
      (e) => e,
    );
    expect(isApiError(failure, 'slot_taken')).toBe(true);
    expect((failure as ApiError).status).toBe(409);
  });

  it('returns undefined for an empty 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(callFunction('account/me', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});

describe('callPublicFunction', () => {
  it('sends only the apikey and encodes the query string', async () => {
    fetchMock.mockResolvedValue(json({ meta: {} }));

    await callPublicFunction('availability', { branch_id: 'b 1', date: '2026-11-02' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      'https://example.supabase.co/functions/v1/availability?branch_id=b+1&date=2026-11-02',
    );
    expect(init.headers).toMatchObject({ apikey: 'pub-key' });
    expect(init.headers.Authorization).toBeUndefined();
  });
});
