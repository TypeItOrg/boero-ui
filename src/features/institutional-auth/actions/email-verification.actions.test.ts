jest.mock("@common/services/authenticated-api-fetch.service", () => ({ authenticatedApiFetch: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
jest.mock("@features/institutional-auth/utils/institutional-auth-cookies.util", () => ({ setInstitutionalEmailVerifiedCookie: jest.fn() }));
jest.mock("@features/institutional-auth/utils/email-verification-context.util", () => ({ clearEmailVerificationContext: jest.fn() }));
import { redirect } from "next/navigation";
import { authenticatedApiFetch } from "@common/services/authenticated-api-fetch.service";
import {
  changePendingEmail,
  confirmEmailVerification,
  resendEmailVerification,
} from "@features/institutional-auth/actions/email-verification.actions";
import { clearEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";
import { setInstitutionalEmailVerifiedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

const api = jest.mocked(authenticatedApiFetch);
const institutionId = "22222222-2222-4222-8222-222222222222";
function form(values: Record<string, string>): FormData {
  const result = new FormData();
  Object.entries(values).forEach(([key, value]) => result.set(key, value));
  return result;
}
beforeEach(() => jest.clearAllMocks());
it("validates identity and credentials before calling the API", async () => {
  expect((await resendEmailVerification({}, form({ institutionId: "bad", documentNumber: "abc" }))).fieldErrors).toBeDefined();
  expect((await changePendingEmail({}, form({ institutionId, documentNumber: "12345678", email: "bad" }))).fieldErrors).toBeDefined();
  expect(api).not.toHaveBeenCalled();
});
it("posts valid resend without credentials and retains a generic success", async () => {
  api.mockResolvedValue(new Response(null, { status: 204 }));
  expect(await resendEmailVerification({}, form({ institutionId, documentNumber: "12345678" }))).toEqual({ success: true });
  expect(api).toHaveBeenCalledWith("/api/v1/auth/email-verification/resend", undefined, expect.objectContaining({ method: "POST" }));
});
it("sends corrected email and password only in the request body", async () => {
  api.mockResolvedValue(new Response(null, { status: 204 }));
  const data = { institutionId, documentNumber: "12345678", password: "secret123", email: "ana@example.com" };
  expect(await changePendingEmail({}, form(data))).toEqual({ success: true });
  expect(api.mock.calls[0][0]).toBe("/api/v1/auth/email-verification/change-email");
  expect(JSON.parse(api.mock.calls[0][2]?.body as string)).toEqual(data);
});
it("preserves cooldown and authentication errors", async () => {
  api.mockResolvedValue(new Response(JSON.stringify({ status: 409, message: "Esperá un minuto" }), { status: 409 }));
  expect(await changePendingEmail({}, form({ institutionId, documentNumber: "12345678", password: "secret123", email: "ana@example.com" }))).toEqual({
    error: "Esperá un minuto",
  });
});
it("handles network failures without reporting success", async () => {
  api.mockRejectedValue(new Error("offline"));
  expect((await resendEmailVerification({}, form({ institutionId, documentNumber: "12345678" }))).error).toBeDefined();
});
it("confirms a valid token and redirects to login with a success flash", async () => {
  api.mockResolvedValue(new Response(null, { status: 204 }));
  await expect(confirmEmailVerification({}, form({ token: "a".repeat(43) }))).rejects.toThrow("NEXT_REDIRECT");
  expect(clearEmailVerificationContext).toHaveBeenCalledTimes(1);
  expect(setInstitutionalEmailVerifiedCookie).toHaveBeenCalledTimes(1);
  expect(redirect).toHaveBeenCalledWith("/auth/login");
});
it("rejects malformed tokens and retains context after expired links", async () => {
  expect((await confirmEmailVerification({}, form({ token: "bad" }))).error).toBeDefined();
  expect(api).not.toHaveBeenCalled();
  api.mockResolvedValue(new Response(JSON.stringify({ message: "Enlace vencido" }), { status: 400 }));
  expect(await confirmEmailVerification({}, form({ token: "a".repeat(43) }))).toEqual({ error: "Enlace vencido" });
  expect(clearEmailVerificationContext).not.toHaveBeenCalled();
  expect(setInstitutionalEmailVerifiedCookie).not.toHaveBeenCalled();
});
