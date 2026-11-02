import { useCallback, useRef } from 'react';

/**
 * Synchronous double-submit guard. A button's `loading`/`disabled` only
 * flips after React Query's (setTimeout-scheduled) notification and a React
 * commit, so on a busy JS thread a second tap can start the same submit
 * again — for a capacity service that is a real second booking. The ref is
 * set before the first await, so a second call made while one is running
 * returns `undefined` immediately without running `task`. Always released in
 * `finally`, after success or failure.
 */
export function useSingleFlight() {
  const inFlight = useRef(false);
  return useCallback(async <T>(task: () => Promise<T>): Promise<T | undefined> => {
    if (inFlight.current) return undefined;
    inFlight.current = true;
    try {
      return await task();
    } finally {
      inFlight.current = false;
    }
  }, []);
}
