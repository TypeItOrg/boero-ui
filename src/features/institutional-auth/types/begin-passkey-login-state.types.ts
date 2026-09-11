import type { PasskeyRequestOptionsJson } from "@features/institutional-auth/types/passkey-request-options-json.types";

export type BeginPasskeyLoginState = {
  error?: string;
  ceremonyId?: string;
  options?: PasskeyRequestOptionsJson;
};
