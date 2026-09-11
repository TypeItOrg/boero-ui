import type { PasskeyCredentialDescriptorJson } from "@features/institutional-auth/types/passkey-credential-descriptor-json.types";

export type PasskeyRequestOptionsJson = {
  challenge: string;
  rpId?: string;
  timeout?: number;
  userVerification?: string;
  allowCredentials?: PasskeyCredentialDescriptorJson[];
};
