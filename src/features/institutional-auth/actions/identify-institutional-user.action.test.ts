jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
jest.mock("@features/institutional-auth/utils/email-verification-context.util", () => ({ setEmailVerificationContext: jest.fn() }));
import { redirect } from "next/navigation";
import { setEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";
jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

jest.mock("@features/institutional-auth/services/identify-institutional.service", () => ({
  identifyInstitutionalAccount: jest.fn(),
}));

import { headers } from "next/headers";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { identifyInstitutionalAccount } from "@features/institutional-auth/services/identify-institutional.service";

const requestHeaders = new Headers({ "user-agent": "Mozilla/5.0" });

function identifyFormData(input: { institutionId?: string; documentNumber?: string } = {}): FormData {
  const formData = new FormData();

  if (input.institutionId) formData.set("institutionId", input.institutionId);
  if (input.documentNumber) formData.set("documentNumber", input.documentNumber);

  return formData;
}

describe("identifyInstitutionalUser", () => {
  const identifyMock = jest.mocked(identifyInstitutionalAccount);
  const headersMock = jest.mocked(headers);

  beforeEach(() => {
    jest.clearAllMocks();
    headersMock.mockResolvedValue(requestHeaders);
  });

  it("returns field errors without calling the backend when the document is invalid", async () => {
    const state = await identifyInstitutionalUser({}, identifyFormData({ institutionId: "inst", documentNumber: "abc" }));

    expect(state.fieldErrors?.documentNumber).toBeDefined();
    expect(identifyMock).not.toHaveBeenCalled();
  });

  it("maps account-not-found to an explicit message", async () => {
    identifyMock.mockResolvedValue({ success: false, error: { status: 404, message: "not found" } });

    const state = await identifyInstitutionalUser(
      {},
      identifyFormData({ institutionId: "8f2e2c9e-1b2a-4f3c-9d4e-5f6a7b8c9d0e", documentNumber: "12345678" }),
    );

    expect(state.error).toBe(INSTITUTIONAL_AUTH_ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
  });

  it("returns the attempt and next step on success", async () => {
    identifyMock.mockResolvedValue({ success: true, data: { loginAttemptId: "attempt", nextStep: "PASSKEY" } });

    const state = await identifyInstitutionalUser(
      {},
      identifyFormData({ institutionId: "8f2e2c9e-1b2a-4f3c-9d4e-5f6a7b8c9d0e", documentNumber: "12345678" }),
    );

    expect(state.loginAttemptId).toBe("attempt");
    expect(state.nextStep).toBe("PASSKEY");
  });
});

it("redirects pending accounts with identity stored outside the URL", async () => {
  const identity = { institutionId: "22222222-2222-4222-8222-222222222222", documentNumber: "12345678" };
  jest.mocked(identifyInstitutionalAccount).mockResolvedValue({ success: true, data: { nextStep: "EMAIL_VERIFICATION", loginAttemptId: null } });
  await expect(identifyInstitutionalUser({}, identifyFormData(identity))).rejects.toThrow("NEXT_REDIRECT");
  expect(setEmailVerificationContext).toHaveBeenCalledWith(identity);
  expect(redirect).toHaveBeenCalledWith("/auth/email-verification");
});
