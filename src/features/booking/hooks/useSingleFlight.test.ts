import { act, renderHook } from '@testing-library/react-native';

import { useSingleFlight } from './useSingleFlight';

// A task whose promise the test settles by hand, so a second call can be made
// while the first is still in flight.
function deferredTask<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { task: jest.fn(() => promise), resolve, reject };
}

describe('useSingleFlight', () => {
  it('runs the task once when called twice synchronously', async () => {
    const { result } = await renderHook(() => useSingleFlight());
    const first = deferredTask<string>();
    const second = jest.fn(async () => 'second');

    let p1!: Promise<string | undefined>;
    let p2!: Promise<string | undefined>;
    await act(async () => {
      p1 = result.current(first.task);
      p2 = result.current(second); // before any await of p1 resolves
      first.resolve('first');
      await Promise.all([p1, p2]);
    });

    expect(first.task).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    await expect(p1).resolves.toBe('first');
    await expect(p2).resolves.toBeUndefined();
  });

  it('releases the guard after success', async () => {
    const { result } = await renderHook(() => useSingleFlight());
    await act(async () => {
      await result.current(async () => 'a');
    });
    const later = jest.fn(async () => 'b');
    await act(async () => {
      await expect(result.current(later)).resolves.toBe('b');
    });
    expect(later).toHaveBeenCalledTimes(1);
  });

  it('releases the guard after a failure', async () => {
    const { result } = await renderHook(() => useSingleFlight());
    await act(async () => {
      await expect(
        result.current(async () => {
          throw new Error('boom');
        }),
      ).rejects.toThrow('boom');
    });
    const later = jest.fn(async () => 'ok');
    await act(async () => {
      await expect(result.current(later)).resolves.toBe('ok');
    });
    expect(later).toHaveBeenCalledTimes(1);
  });
});
