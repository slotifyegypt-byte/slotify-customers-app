// One error shape for everything the backend can throw at us — Postgres/RPC
// errors from supabase-js and Edge Function HTTP responses — so screens can
// switch on a stable machine `code` instead of parsing messages.
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string = code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// developer-guide.md §9. Our own errors are raised as `PTnnn` (nnn = the HTTP
// status) with the machine code in `message`; a few raw Postgres codes (RLS,
// unique, check) are mapped to friendly codes.
export function fromPostgrest(e: { code?: string; message: string; details?: string }): ApiError {
  const pt = e.code?.match(/^PT(\d{3})$/);
  if (pt) return new ApiError(e.message, Number(pt[1]), e.details ?? e.message);

  switch (e.code) {
    case '23505':
      return new ApiError('duplicate', 409, e.message);
    case '42501':
      return new ApiError('forbidden', 403, e.message);
    case '23514':
      return new ApiError('invalid_field', 400, e.message);
    default:
      return new ApiError('unknown', 500, e.message);
  }
}

// Edge Functions answer with a real HTTP status and `{ code, message }`.
export async function fromResponse(res: Response): Promise<ApiError> {
  let body: { code?: unknown; message?: unknown } = {};
  try {
    body = await res.json();
  } catch {
    // Not JSON (e.g. a gateway error page) — fall through to `unknown`.
  }
  const code = typeof body.code === 'string' ? body.code : 'unknown';
  const message = typeof body.message === 'string' ? body.message : res.statusText || code;
  return new ApiError(code, res.status, message);
}

export function isApiError(e: unknown, code?: string): e is ApiError {
  return e instanceof ApiError && (code === undefined || e.code === code);
}
