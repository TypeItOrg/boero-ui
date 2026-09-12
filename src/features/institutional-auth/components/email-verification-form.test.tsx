import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock("@features/institutional-auth/actions/email-verification.actions", () => ({
  resendEmailVerification: jest.fn(),
  changePendingEmail: jest.fn(),
}));
jest.mock("@features/institutional-auth/components/institution-picker", () => ({
  InstitutionPicker: ({ value }: { value?: string }) => <input name="institutionId" type="hidden" value={value ?? ""} />,
}));
import { resendEmailVerification, changePendingEmail } from "@features/institutional-auth/actions/email-verification.actions";
import { EmailVerificationForm } from "@features/institutional-auth/components/email-verification-form";
const context = { institutionId: "22222222-2222-4222-8222-222222222222", documentNumber: "12345678", institutionName: "Boero" };
it("reuses identity and shows a generic resend acknowledgement", async () => {
  jest.mocked(resendEmailVerification).mockResolvedValue({ success: true });
  render(<EmailVerificationForm context={context} />);
  expect(screen.getByLabelText(/Documento/)).toHaveValue("12345678");
  await userEvent.click(screen.getByRole("button", { name: "Reenviar enlace" }));
  expect(await screen.findByText(/Si tu cuenta está pendiente/)).toBeVisible();
  const sent = jest.mocked(resendEmailVerification).mock.calls[0][1];
  expect(sent.get("institutionId")).toBe(context.institutionId);
});
it("requests password to correct email and preserves field errors", async () => {
  jest.mocked(changePendingEmail).mockResolvedValue({ error: "Credenciales inválidas" });
  render(<EmailVerificationForm context={context} />);
  await userEvent.click(screen.getByRole("button", { name: "Cambiar correo electrónico" }));
  await userEvent.type(screen.getByLabelText(/Nuevo correo electrónico/), "correct@example.com");
  await userEvent.type(screen.getByLabelText(/Contraseña de tu cuenta/), "incorrecta");
  await userEvent.click(screen.getByRole("button", { name: "Cambiar correo electrónico y enviar enlace" }));
  expect(await screen.findByText("Credenciales inválidas")).toBeVisible();
  expect(screen.getByLabelText(/Documento/)).toHaveValue("12345678");
});
