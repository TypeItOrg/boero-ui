jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
jest.mock("@features/institutional-auth/services/register-institutional.service", () => ({ registerInstitutionalAccount: jest.fn() }));
jest.mock("@features/institutional-auth/utils/email-verification-context.util", () => ({ setEmailVerificationContext: jest.fn() }));
import { redirect } from "next/navigation";
import { registerInstitutional } from "@features/institutional-auth/actions/institutional-register.action";
import { registerInstitutionalAccount } from "@features/institutional-auth/services/register-institutional.service";
import { setEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";
it("redirects successful registrations to verification without authentication cookies", async () => {
  const identity = { institutionId: "22222222-2222-4222-8222-222222222222", documentNumber: "12345678" };
  const data = {
    ...identity,
    name: "Ana",
    lastName: "Garcia",
    birthDate: "2000-01-01",
    email: "ana@example.com",
    password: "password123",
    confirmPassword: "password123",
  };
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => form.set(key, value));
  jest
    .mocked(registerInstitutionalAccount)
    .mockResolvedValue({ success: true, data: { ...identity, userId: "id", emailVerificationRequired: true } });
  await expect(registerInstitutional({}, form)).rejects.toThrow("NEXT_REDIRECT");
  expect(setEmailVerificationContext).toHaveBeenCalledWith(identity);
  expect(redirect).toHaveBeenCalledWith("/auth/email-verification");
});
