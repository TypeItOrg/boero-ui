import { bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";
import {
  optionalEnum,
  optionalString,
  optionalTimeout,
  requireBytes,
  requireNonEmptyString,
  requireRecord,
  requireStringArray,
} from "@features/institutional-auth/utils/webauthn-json.util";

const USER_VERIFICATION_VALUES = ["required", "preferred", "discouraged"] as const;
const RESIDENT_KEY_VALUES = ["required", "preferred", "discouraged"] as const;
const ATTESTATION_VALUES = ["none", "indirect", "direct", "enterprise"] as const;
const AUTHENTICATOR_ATTACHMENT_VALUES = ["platform", "cross-platform"] as const;

type NativeCreationParser = (options: unknown) => PublicKeyCredentialCreationOptions;

function nativeCreationParser(): NativeCreationParser | undefined {
  const credential = (globalThis as unknown as Record<string, unknown>).PublicKeyCredential as Record<string, unknown> | undefined;
  const parse = credential?.["parseCreationOptionsFromJSON"];
  return typeof parse === "function" ? (parse as NativeCreationParser) : undefined;
}

function toDescriptor(descriptor: unknown): PublicKeyCredentialDescriptor {
  const source = requireRecord(descriptor);
  if (source.type !== "public-key") {
    throw new Error("Invalid WebAuthn options");
  }
  const result: PublicKeyCredentialDescriptor = {
    id: requireBytes(source.id),
    type: "public-key",
  };
  if (source.transports !== undefined && source.transports !== null) {
    result.transports = requireStringArray(source.transports) as AuthenticatorTransport[];
  }
  return result;
}

function toDescriptors(value: unknown): PublicKeyCredentialDescriptor[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error("Invalid WebAuthn options");
  }
  return (value as unknown[]).map(toDescriptor);
}

function toFallbackCreationOptions(options: unknown): PublicKeyCredentialCreationOptions {
  const source = requireRecord(options);
  const rp = requireRecord(source.rp);
  const user = requireRecord(source.user);
  if (!Array.isArray(source.pubKeyCredParams)) {
    throw new Error("Invalid WebAuthn options");
  }
  if (typeof user.displayName !== "string") {
    throw new Error("Invalid WebAuthn options");
  }

  const rpValue: PublicKeyCredentialRpEntity = { name: requireNonEmptyString(rp.name) };
  const rpId = optionalString(rp.id);
  if (rpId !== undefined) rpValue.id = rpId;

  const result: PublicKeyCredentialCreationOptions = {
    rp: rpValue,
    user: {
      id: requireBytes(user.id),
      name: requireNonEmptyString(user.name),
      displayName: user.displayName,
    },
    challenge: requireBytes(source.challenge),
    pubKeyCredParams: (source.pubKeyCredParams as unknown[]).map((param) => {
      const entry = requireRecord(param);
      if (entry.type !== "public-key" || typeof entry.alg !== "number") {
        throw new Error("Invalid WebAuthn options");
      }
      return { type: "public-key", alg: entry.alg } as PublicKeyCredentialParameters;
    }),
    excludeCredentials: toDescriptors(source.excludeCredentials),
  };

  const timeout = optionalTimeout(source.timeout);
  if (timeout !== undefined) result.timeout = timeout;

  if (source.authenticatorSelection !== undefined && source.authenticatorSelection !== null) {
    const selection = requireRecord(source.authenticatorSelection);
    const authenticatorSelection: AuthenticatorSelectionCriteria = {};
    const residentKey = optionalEnum(selection.residentKey, RESIDENT_KEY_VALUES);
    if (residentKey !== undefined) authenticatorSelection.residentKey = residentKey;
    const userVerification = optionalEnum(selection.userVerification, USER_VERIFICATION_VALUES);
    if (userVerification !== undefined) authenticatorSelection.userVerification = userVerification;
    const attachment = optionalEnum(selection.authenticatorAttachment, AUTHENTICATOR_ATTACHMENT_VALUES);
    if (attachment !== undefined) authenticatorSelection.authenticatorAttachment = attachment;
    result.authenticatorSelection = authenticatorSelection;
  }

  const attestation = optionalEnum(source.attestation, ATTESTATION_VALUES);
  if (attestation !== undefined) result.attestation = attestation;

  return result;
}

export function toPublicKeyCreationOptions(options: unknown): PublicKeyCredentialCreationOptions {
  const parse = nativeCreationParser();
  if (parse) {
    return parse(options);
  }
  return toFallbackCreationOptions(options);
}

export async function createPasskeyCredential(creationOptions: PublicKeyCredentialCreationOptions, signal?: AbortSignal): Promise<unknown> {
  const credential = (await navigator.credentials.create({
    publicKey: creationOptions,
    ...(signal ? { signal } : {}),
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new DOMException("Ceremony cancelled", "NotAllowedError");
  }

  if (typeof credential.toJSON === "function") {
    return credential.toJSON();
  }

  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    id: credential.id,
    rawId: bytesToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bytesToBase64Url(response.attestationObject),
      clientDataJSON: bytesToBase64Url(response.clientDataJSON),
      transports: typeof response.getTransports === "function" ? response.getTransports() : [],
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}
