import { base64UrlToBytes, bytesToBase64Url } from "@features/institutional-auth/utils/webauthn-base64url.util";

describe("webauthn-base64url", () => {
  it.each([
    [[], ""],
    [[0], "AA"],
    [[0, 1], "AAE"],
    [[0, 1, 2, 250, 255], "AAEC-v8"],
    [[251, 255, 190], "-_--"],
  ])("encodes and decodes known bytes %j", (bytes, encoded) => {
    const value = new Uint8Array(bytes);

    expect(bytesToBase64Url(value)).toBe(encoded);
    expect(bytesToBase64Url(value.buffer)).toBe(encoded);
    expect(base64UrlToBytes(encoded)).toEqual(value);
  });

  it("encodes only the selected view of a buffer", () => {
    expect(bytesToBase64Url(new Uint8Array([255, 0, 1, 255]).subarray(1, 3))).toBe("AAE");
  });

  it("rejects values outside the base64url alphabet", () => {
    expect(() => base64UrlToBytes("!!!")).toThrow();
    expect(() => base64UrlToBytes("ab cd")).toThrow();
  });
});
