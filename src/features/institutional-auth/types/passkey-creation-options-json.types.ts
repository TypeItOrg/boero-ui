import type { PasskeyCredentialDescriptorJson } from "@features/institutional-auth/types/passkey-credential-descriptor-json.types";

export type PasskeyCreationOptionsJson = {
  challenge: string;
  rp: { id?: string; name: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: { type: string; alg: number }[];
  timeout?: number;
  excludeCredentials?: PasskeyCredentialDescriptorJson[];
  authenticatorSelection?: {
    residentKey?: string;
    userVerification?: string;
    authenticatorAttachment?: string;
  };
  attestation?: string;
};
