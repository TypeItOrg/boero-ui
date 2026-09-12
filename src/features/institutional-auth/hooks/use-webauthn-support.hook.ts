import { useSyncExternalStore } from "react";

import { isWebAuthnSupported } from "@features/institutional-auth/utils/webauthn-capability.util";

function subscribe(): () => void {
  return () => undefined;
}

function getServerSnapshot(): null {
  return null;
}

export function useWebAuthnSupport(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, isWebAuthnSupported, getServerSnapshot);
}
