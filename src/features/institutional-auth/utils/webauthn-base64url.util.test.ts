import { base64UrlToBytes, bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";

describe("webauthn-base64url", () => {
  it("round-trips bytes through base64url", () => {
    const original = new Uint8Array([0, 1, 2, 250, 255]);

    expect(base64UrlToBytes(bytesToBase64Url(original))).toEqual(original);
  });

  it("produces url-safe output without padding", () => {
    const encoded = bytesToBase64Url(new Uint8Array([251, 255, 190]));

    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("rejects values outside the base64url alphabet", () => {
    expect(() => base64UrlToBytes("!!!")).toThrow();
    expect(() => base64UrlToBytes("ab cd")).toThrow();
  });
});
