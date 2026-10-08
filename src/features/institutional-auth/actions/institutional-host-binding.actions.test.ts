jest.mock("next/headers", () => ({ headers: jest.fn(async () => new Headers({ host: "cboero.testing.typeit.com.ar" })) }));
jest.mock("@common/services/institutional-host/institutional-host.service", () => ({
  validateRequestInstitutionId: jest.fn(async () => "La institución no corresponde a este acceso."),
}));
jest.mock("@features/institutional-auth/services/identify-institutional.service", () => ({ identifyInstitutionalAccount: jest.fn() }));
jest.mock("@features/institutional-auth/services/register-institutional.service", () => ({ registerInstitutionalAccount: jest.fn() }));
jest.mock("@features/institutional-auth/services/request-institutional-password-recovery.service", () => ({
  requestInstitutionalPasswordRecovery: jest.fn(),
}));
jest.mock("@common/services/authenticated-api-fetch.service", () => ({ authenticatedApiFetch: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { registerInstitutional } from "@features/institutional-auth/actions/institutional-register.action";
import { requestPasswordRecovery } from "@features/institutional-auth/actions/request-institutional-password-recovery.action";
import { resendEmailVerification, changePendingEmail } from "@features/institutional-auth/actions/email-verification.actions";
import { identifyInstitutionalAccount } from "@features/institutional-auth/services/identify-institutional.service";
import { registerInstitutionalAccount } from "@features/institutional-auth/services/register-institutional.service";
import { requestInstitutionalPasswordRecovery } from "@features/institutional-auth/services/request-institutional-password-recovery.service";
import { authenticatedApiFetch } from "@common/services/authenticated-api-fetch.service";

function form(): FormData {
  const data = new FormData();
  const values = {
    institutionId: "33333333-3333-4333-8333-333333333333",
    documentNumber: "12345678",
    name: "Ana",
    lastName: "Garcia",
    birthDate: "2000-01-01",
    isGuardian: "false",
    email: "ana@example.com",
    password: "password123",
    confirmPassword: "password123",
  };
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}
it.each([identifyInstitutionalUser, registerInstitutional, requestPasswordRecovery, resendEmailVerification, changePendingEmail])(
  "[A03.payload-context] rejects tampered hidden institutionId before auth transport ($name)",
  async (action) => {
    const result = await action({}, form());
    expect(result.error).toMatch(/no corresponde/);
    expect(identifyInstitutionalAccount).not.toHaveBeenCalled();
    expect(registerInstitutionalAccount).not.toHaveBeenCalled();
    expect(requestInstitutionalPasswordRecovery).not.toHaveBeenCalled();
    expect(authenticatedApiFetch).not.toHaveBeenCalled();
  },
);
