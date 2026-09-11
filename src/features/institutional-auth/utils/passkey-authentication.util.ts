import { bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";
import {
  optionalEnum,
  optionalString,
  optionalTimeout,
  requireBytes,
  requireRecord,
  requireStringArray,
} from "@features/institutional-auth/utils/webauthn-json.util";

const USER_VERIFICATION_VALUES = ["required", "preferred", "discouraged"] as const;

type NativeRequestParser = (options: unknown) => PublicKeyCredentialRequestOptions;

function nativeRequestParser(): NativeRequestParser | undefined {
  const credential = (globalThis as unknown as Record<string, unknown>).PublicKeyCredential as Record<string, unknown> | undefined;
  const parse = credential?.["parseRequestOptionsFromJSON"];
  return typeof parse === "function" ? (parse as NativeRequestParser) : undefined;
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

function toFallbackRequestOptions(options: unknown): PublicKeyCredentialRequestOptions {
  const source = requireRecord(options);
  const result: PublicKeyCredentialRequestOptions = {
    challenge: requireBytes(source.challenge),
    allowCredentials: toDescriptors(source.allowCredentials),
  };
  const rpId = optionalString(source.rpId);
  if (rpId !== undefined) result.rpId = rpId;
  const timeout = optionalTimeout(source.timeout);
  if (timeout !== undefined) result.timeout = timeout;
  const userVerification = optionalEnum(source.userVerification, USER_VERIFICATION_VALUES);
  if (userVerification !== undefined) result.userVerification = userVerification;
  return result;
}

export function toPublicKeyRequestOptions(options: unknown): PublicKeyCredentialRequestOptions {
  const parse = nativeRequestParser();
  if (parse) {
    return parse(options);
  }
  return toFallbackRequestOptions(options);
}

export async function getPasskeyAssertion(requestOptions: PublicKeyCredentialRequestOptions, signal?: AbortSignal): Promise<unknown> {
  const credential = (await navigator.credentials.get({
    publicKey: requestOptions,
    ...(signal ? { signal } : {}),
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new DOMException("Ceremony cancelled", "NotAllowedError");
  }

  if (typeof credential.toJSON === "function") {
    return credential.toJSON();
  }

  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bytesToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      authenticatorData: bytesToBase64Url(response.authenticatorData),
      clientDataJSON: bytesToBase64Url(response.clientDataJSON),
      signature: bytesToBase64Url(response.signature),
      userHandle: response.userHandle ? bytesToBase64Url(response.userHandle) : null,
    },
    clientExtensionResults: credential.getClientExtensionResults(),
  };
}

export function isUserCancelled(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError");
}
