import { isWebAuthnSupported } from "@features/institutional-auth/utils/webauthn-capability.util";

describe("webauthn-capability", () => {
  const originalPublicKeyCredential = window.PublicKeyCredential;
  const originalCredentials = navigator.credentials;

  afterEach(() => {
    Object.defineProperty(window, "PublicKeyCredential", { value: originalPublicKeyCredential, configurable: true });
    Object.defineProperty(navigator, "credentials", { value: originalCredentials, configurable: true });
  });

  it("reports supported when the platform exposes credentials", () => {
    Object.defineProperty(window, "PublicKeyCredential", { value: function () {}, configurable: true });
    Object.defineProperty(navigator, "credentials", { value: { create: jest.fn(), get: jest.fn() }, configurable: true });

    expect(isWebAuthnSupported()).toBe(true);
  });

  it("reports unsupported when PublicKeyCredential is missing", () => {
    Object.defineProperty(window, "PublicKeyCredential", { value: undefined, configurable: true });

    expect(isWebAuthnSupported()).toBe(false);
  });

  it("reports unsupported when credentials api is missing", () => {
    Object.defineProperty(window, "PublicKeyCredential", { value: function () {}, configurable: true });
    Object.defineProperty(navigator, "credentials", { value: undefined, configurable: true });

    expect(isWebAuthnSupported()).toBe(false);
  });
});
