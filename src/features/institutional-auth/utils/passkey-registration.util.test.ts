import { toPublicKeyCreationOptions } from "@features/institutional-auth/utils/passkey-registration.util";
import { bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";

const CHALLENGE = bytesToBase64Url(new Uint8Array([1, 2, 3]));
const USER_ID = bytesToBase64Url(new Uint8Array([7, 8, 9]));
const EXCLUDE_ID = bytesToBase64Url(new Uint8Array([4, 5, 6]));

function validOptions(): Record<string, unknown> {
  return {
    challenge: CHALLENGE,
    rp: { id: "localhost", name: "Boero" },
    user: { id: USER_ID, name: "12345678", displayName: "Ana Garcia" },
    pubKeyCredParams: [
      { type: "public-key", alg: -8 },
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ],
    timeout: 300000,
    excludeCredentials: [{ id: EXCLUDE_ID, type: "public-key", transports: ["hybrid", "internal"] }],
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
    attestation: "none",
  };
}

function clearNativeWebAuthn(): void {
  delete (globalThis as Record<string, unknown>).PublicKeyCredential;
}

describe("passkey-registration", () => {
  afterEach(clearNativeWebAuthn);

  it("maps server options to creation options without inventing fields", () => {
    clearNativeWebAuthn();

    const options = toPublicKeyCreationOptions(validOptions());

    expect(options.challenge).toBeInstanceOf(Uint8Array);
    expect(options.rp).toEqual({ id: "localhost", name: "Boero" });
    expect(options.user.name).toBe("12345678");
    expect(options.user.displayName).toBe("Ana Garcia");
    expect(options.pubKeyCredParams).toEqual([
      { type: "public-key", alg: -8 },
      { type: "public-key", alg: -7 },
      { type: "public-key", alg: -257 },
    ]);
    expect(options.excludeCredentials).toHaveLength(1);
    expect(options.authenticatorSelection).toEqual({ residentKey: "required", userVerification: "required" });
    expect(options.attestation).toBe("none");
  });

  it("uses the native JSON parser when available", () => {
    const sentinel = { native: true };
    const parse = jest.fn().mockReturnValue(sentinel);
    (globalThis as Record<string, unknown>).PublicKeyCredential = { parseCreationOptionsFromJSON: parse };
    const raw = validOptions();

    expect(toPublicKeyCreationOptions(raw)).toBe(sentinel);
    expect(parse).toHaveBeenCalledWith(raw);
  });

  it.each([
    ["missing challenge", { ...validOptions(), challenge: undefined }],
    ["invalid base64url challenge", { ...validOptions(), challenge: "!!!" }],
    ["missing user", { ...validOptions(), user: undefined }],
    ["invalid user id", { ...validOptions(), user: { id: "!!!", name: "12345678", displayName: "Ana" } }],
    ["missing user name", { ...validOptions(), user: { id: USER_ID, displayName: "Ana" } }],
    ["missing pubKeyCredParams", { ...validOptions(), pubKeyCredParams: undefined }],
    ["invented fallback alg is rejected", { ...validOptions(), pubKeyCredParams: [{ type: "public-key" }] }],
    ["wrong param type", { ...validOptions(), pubKeyCredParams: [{ type: "password", alg: -7 }] }],
    ["invalid exclude entry is not dropped silently", { ...validOptions(), excludeCredentials: [{ id: "!!!", type: "public-key" }] }],
    ["invalid residentKey", { ...validOptions(), authenticatorSelection: { residentKey: "sometimes" } }],
    ["invalid attestation", { ...validOptions(), attestation: "sometimes" }],
    ["null options", null],
  ])("fails closed on %s instead of inventing a ceremony", (_name, options) => {
    clearNativeWebAuthn();

    expect(() => toPublicKeyCreationOptions(options)).toThrow();
  });

  it("omits optional sections the server does not send", () => {
    clearNativeWebAuthn();
    const minimal = validOptions();
    delete minimal.authenticatorSelection;
    delete minimal.attestation;
    delete minimal.excludeCredentials;

    const options = toPublicKeyCreationOptions(minimal);

    expect(options.excludeCredentials).toEqual([]);
    expect(options.authenticatorSelection).toBeUndefined();
    expect(options.attestation).toBeUndefined();
  });
});
