import { getPasskeyAssertion, isUserCancelled, toPublicKeyRequestOptions } from "@features/institutional-auth/utils/passkey-authentication.util";
import { bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";

const CHALLENGE = bytesToBase64Url(new Uint8Array([1, 2, 3]));
const DESCRIPTOR_ID = bytesToBase64Url(new Uint8Array([4, 5, 6]));

function clearNativeWebAuthn(): void {
  delete (globalThis as Record<string, unknown>).PublicKeyCredential;
}

describe("passkey-authentication", () => {
  afterEach(clearNativeWebAuthn);

  it("maps server options to a credential request without allowCredentials", () => {
    clearNativeWebAuthn();

    const options = toPublicKeyRequestOptions({ challenge: CHALLENGE, rpId: "localhost", userVerification: "required", allowCredentials: [] });

    expect(options.rpId).toBe("localhost");
    expect(options.allowCredentials).toEqual([]);
    expect(options.challenge).toBeInstanceOf(Uint8Array);
  });

  it("uses the native JSON parser when available", () => {
    const sentinel = { native: true };
    const parse = jest.fn().mockReturnValue(sentinel);
    (globalThis as Record<string, unknown>).PublicKeyCredential = { parseRequestOptionsFromJSON: parse };
    const raw = { challenge: CHALLENGE, allowCredentials: [] };

    expect(toPublicKeyRequestOptions(raw)).toBe(sentinel);
    expect(parse).toHaveBeenCalledWith(raw);
  });

  it.each([
    ["missing challenge", {}],
    ["non-string challenge", { challenge: 42 }],
    ["invalid base64url challenge", { challenge: "!!!" }],
    ["empty challenge", { challenge: "" }],
    ["null options", null],
    ["array options", []],
    ["non-array allowCredentials", { challenge: CHALLENGE, allowCredentials: "no" }],
    ["descriptor without id", { challenge: CHALLENGE, allowCredentials: [{}] }],
    ["descriptor with invalid id", { challenge: CHALLENGE, allowCredentials: [{ id: "!!!", type: "public-key" }] }],
    ["descriptor with wrong type", { challenge: CHALLENGE, allowCredentials: [{ id: DESCRIPTOR_ID, type: "password" }] }],
    [
      "descriptor with invalid transports",
      { challenge: CHALLENGE, allowCredentials: [{ id: DESCRIPTOR_ID, type: "public-key", transports: "usb" }] },
    ],
    ["invalid userVerification", { challenge: CHALLENGE, userVerification: "sometimes" }],
    ["invalid timeout", { challenge: CHALLENGE, timeout: -1 }],
  ])("fails closed on %s instead of inventing a ceremony", (_name, options) => {
    clearNativeWebAuthn();

    expect(() => toPublicKeyRequestOptions(options)).toThrow();
  });

  it("defaults to discoverable credentials when the server omits the allow list", () => {
    clearNativeWebAuthn();

    expect(toPublicKeyRequestOptions({ challenge: CHALLENGE }).allowCredentials).toEqual([]);
  });

  it("detects user cancellation as a silent error", () => {
    expect(isUserCancelled(new DOMException("cancelled", "NotAllowedError"))).toBe(true);
    expect(isUserCancelled(new DOMException("aborted", "AbortError"))).toBe(true);
    expect(isUserCancelled(new Error("boom"))).toBe(false);
  });

  it("forwards an abort signal to the authenticator", async () => {
    const getMock = jest.fn().mockResolvedValue(null);
    Object.defineProperty(navigator, "credentials", { value: { get: getMock }, configurable: true });
    const controller = new AbortController();

    await expect(
      getPasskeyAssertion(toPublicKeyRequestOptions({ challenge: bytesToBase64Url(new Uint8Array([1])) }), controller.signal),
    ).rejects.toThrow();

    expect(getMock).toHaveBeenCalledWith(expect.objectContaining({ signal: controller.signal }));
  });
});
