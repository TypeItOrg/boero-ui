import type { Passkey } from "@features/institutional-auth/types/passkey.types";

export type PasskeyList = {
  passkeys: Passkey[];
  maxActivePasskeys: number;
};
