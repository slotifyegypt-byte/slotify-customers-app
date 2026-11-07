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

describe('request timeout', () => {
  afterEach(() => jest.useRealTimers());

  const hangsUntilAborted = (_url: string, init: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')),
      );
    });

  it('gives up on a read that never answers after 20 seconds, as a network_error', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangsUntilAborted);

    const pending = callFunction('account/me').catch((e) => e);
    await jest.advanceTimersByTimeAsync(20_001);
    const failure: unknown = await pending;

    expect(isApiError(failure, 'network_error')).toBe(true);
    expect((failure as ApiError).status).toBe(0);
  });

  it('waits much longer for a write, so a slow booking is not abandoned and retried', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangsUntilAborted);
    let settled = false;

    const pending = callFunction('bookings', { method: 'POST', body: {} })
      .catch((e) => e)
      .then((e) => {
        settled = true;
        return e;
      });
    await jest.advanceTimersByTimeAsync(30_000);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(30_001);
    expect(isApiError(await pending, 'network_error')).toBe(true);
  });

  it('also covers a response whose body stalls after the headers arrived', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation((_url: string, init: RequestInit) =>
      Promise.resolve({
        ok: true,
        text: () =>
          new Promise<string>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      } as unknown as Response),
    );

    const pending = callFunction('account/me').catch((e) => e);
    await jest.advanceTimersByTimeAsync(20_001);

    expect(isApiError(await pending, 'network_error')).toBe(true);
  });

  it('does the same for public calls', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangsUntilAborted);

    const pending = callPublicFunction('availability', { a: 'b' }).catch((e) => e);
    await jest.advanceTimersByTimeAsync(20_001);

    expect(isApiError(await pending, 'network_error')).toBe(true);
  });

  it('passes an abort signal and leaves no timer behind after a fast answer', async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValue(json({ ok: true }));

    await callFunction('account/me');

    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe('network failures', () => {
  it('callFunction wraps a fetch rejection in ApiError(network_error, 0)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const failure: unknown = await callFunction('account/me', { method: 'DELETE' }).catch((e) => e);
    expect(isApiError(failure, 'network_error')).toBe(true);
    expect((failure as ApiError).status).toBe(0);
  });

  it('callPublicFunction wraps a fetch rejection in ApiError(network_error, 0)', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    const failure: unknown = await callPublicFunction('availability', { a: 'b' }).catch((e) => e);
    expect(isApiError(failure, 'network_error')).toBe(true);
    expect((failure as ApiError).status).toBe(0);
  });
});
