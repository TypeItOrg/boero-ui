import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => !window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`).matches,
    () => false,
  );
}
