import { useSyncExternalStore } from "react";

import { isWebAuthnSupported } from "@features/institutional-auth/utils/webauthn-capability.util";

function subscribe(): () => void {
  return () => undefined;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useWebAuthnSupport(): boolean {
  return useSyncExternalStore(subscribe, isWebAuthnSupported, getServerSnapshot);
}
