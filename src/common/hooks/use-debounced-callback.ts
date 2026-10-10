"use client";

import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<TArguments extends unknown[]>(callback: (...args: TArguments) => void, delayMs: number) {
  const timeoutRef = useRef<number | undefined>(undefined);

  const cancel = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }, []);

  const schedule = useCallback(
    (...args: TArguments) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        callback(...args);
      }, delayMs);
    },
    [callback, cancel, delayMs],
  );

  // A queued edit belongs to this callback's route/filter and must not outlive it.
  useEffect(() => cancel, [callback, cancel, delayMs]);

  return { schedule, cancel };
}
