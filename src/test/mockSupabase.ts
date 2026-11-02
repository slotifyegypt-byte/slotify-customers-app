interface MockResult {
  data?: unknown;
  error?: unknown;
  count?: number;
}

type MockBuilder = PromiseLike<MockResult> & Record<string, (...args: any[]) => MockBuilder>;

/**
 * Stand-in for a supabase-js query builder (`from('x').select().eq()…`):
 * every method returns the builder itself, and awaiting it resolves to
 * `result`. `calls` records the chain so tests can assert on it, e.g.
 * `from.mockReturnValue(builder)` then `expect(calls).toContainEqual(['eq', ['id', 1]])`.
 */
export function mockQuery(result: MockResult) {
  const calls: [method: string, args: unknown[]][] = [];
  const builder: MockBuilder = new Proxy({} as MockBuilder, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      if (prop === 'then') {
        return (resolve: (value: MockResult) => unknown, reject?: (reason: unknown) => unknown) =>
          Promise.resolve(result).then(resolve, reject);
      }
      return (...args: unknown[]) => {
        calls.push([prop, args]);
        return builder;
      };
    },
  });
  return { builder, calls };
}
