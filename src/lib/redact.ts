// Scrubs personal data and credentials before anything leaves the device (Sentry events and
// breadcrumbs). Deliberately conservative: it masks what the app is known to handle (emails,
// E.164 phones, bearer tokens, JWTs) and anything stored under a credential-looking key. Ids, timestamps and numbers pass through untouched.

const SENSITIVE_KEY = /pass(word)?|token|authorization|api[-_]?key|secret/i;
// Fields Sentry fills in itself. They are never personal, and rewriting them breaks the tool: a release such as
// "com.slotify.customers@1.0.0+12" looks like an address to the email rule and would stop symbolication and release
// health from matching.
const PASSTHROUGH_KEY =
  /^(release|dist|environment|platform|event_id|server_name|type|level|logger)$/;
const MAX_DEPTH = 8;

const STRING_RULES: [RegExp, string][] = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [token]'],
  [/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*/g, '[jwt]'],
  // Bounded on purpose: an unbounded `[^\s@]+@` rescans a long string without an "@" from every position (quadratic),
  // and this runs on the error path. A real address ends in letters, which also keeps "name@1.0.0" out.
  [/[^\s@]{1,64}@[^\s@]{1,255}\.[A-Za-z]{2,24}/g, '[email]'],
  [/\+\d[\d\s-]{7,}\d/g, '[phone]'],
];

function redactString(s: string): string {
  return STRING_RULES.reduce((acc, [re, to]) => acc.replace(re, to), s);
}

function walk(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') return redactString(value);
  if (typeof value !== 'object' || value === null) return value;
  // `seen` holds only the objects on the way down to this one, so a circular reference is caught but an object that
  // simply appears in two places is kept in both.
  if (seen.has(value)) return '[circular]';
  if (depth >= MAX_DEPTH) return '[truncated]';
  seen.add(value);
  try {
    if (value instanceof Error) return { name: value.name, message: redactString(value.message) };
    if (Array.isArray(value)) return value.map((v) => walk(v, depth + 1, seen));

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEY.test(k)) out[k] = '[redacted]';
      else if (typeof v === 'string' && PASSTHROUGH_KEY.test(k)) out[k] = v;
      else out[k] = walk(v, depth + 1, seen);
    }
    return out;
  } finally {
    seen.delete(value);
  }
}

export function redact(value: unknown): unknown {
  return walk(value, 0, new WeakSet());
}
