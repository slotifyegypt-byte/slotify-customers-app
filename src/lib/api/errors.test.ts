import { ApiError, fromPostgrest, fromResponse, isApiError } from './errors';

describe('fromPostgrest', () => {
  it('maps PTnnn errors to the machine code in the message and the nnn status', () => {
    const error = fromPostgrest({ code: 'PT409', message: 'last_owner' });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('last_owner');
    expect(error.status).toBe(409);
  });

  it('maps unique violations to duplicate/409', () => {
    const error = fromPostgrest({ code: '23505', message: 'duplicate key value' });
    expect([error.code, error.status]).toEqual(['duplicate', 409]);
  });

  it('maps RLS refusals to forbidden/403', () => {
    const error = fromPostgrest({ code: '42501', message: 'new row violates RLS' });
    expect([error.code, error.status]).toEqual(['forbidden', 403]);
  });

  it('maps check violations to invalid_field/400', () => {
    const error = fromPostgrest({ code: '23514', message: 'phone not E.164' });
    expect([error.code, error.status]).toEqual(['invalid_field', 400]);
  });

  it('maps PGRST116 (no rows for .single()) to not_found/404', () => {
    const error = fromPostgrest({
      code: 'PGRST116',
      message: 'JSON object requested, multiple (or no) rows returned',
    });
    expect([error.code, error.status]).toEqual(['not_found', 404]);
  });

  it('falls back to unknown/500', () => {
    expect([
      fromPostgrest({ message: 'boom' }).code,
      fromPostgrest({ message: 'boom' }).status,
    ]).toEqual(['unknown', 500]);
    expect(fromPostgrest({ code: 'XX000', message: 'boom' }).status).toBe(500);
  });
});

describe('fromResponse', () => {
  it('reads code and message from the JSON body and keeps the HTTP status', async () => {
    const res = new Response(JSON.stringify({ code: 'slot_taken', message: 'x' }), { status: 409 });
    const error = await fromResponse(res);
    expect(error.code).toBe('slot_taken');
    expect(error.message).toBe('x');
    expect(error.status).toBe(409);
  });

  it('falls back to unknown when the body is not JSON', async () => {
    const error = await fromResponse(new Response('Bad gateway', { status: 502 }));
    expect([error.code, error.status]).toEqual(['unknown', 502]);
  });
});

describe('isApiError', () => {
  const error = new ApiError('slot_taken', 409, 'x');

  it('narrows ApiError instances, optionally by code', () => {
    expect(isApiError(error)).toBe(true);
    expect(isApiError(error, 'slot_taken')).toBe(true);
    expect(isApiError(error, 'forbidden')).toBe(false);
  });

  it('rejects other values', () => {
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
