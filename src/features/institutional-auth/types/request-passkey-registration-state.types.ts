import type { PasskeyCreationOptionsJson } from "@features/institutional-auth/types/passkey-creation-options-json.types";

export type RequestPasskeyRegistrationState = {
  error?: string;
  fieldErrors?: Partial<Record<"label", string>>;
  ceremonyId?: string;
  options?: PasskeyCreationOptionsJson;
};
