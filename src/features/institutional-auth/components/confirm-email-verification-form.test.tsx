import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
jest.mock("@features/institutional-auth/actions/email-verification.actions", () => ({ confirmEmailVerification: jest.fn() }));
import { confirmEmailVerification } from "@features/institutional-auth/actions/email-verification.actions";
import { ConfirmEmailVerificationForm } from "@features/institutional-auth/components/confirm-email-verification-form";
it("does not consume the token on load and submits only on click", async () => {
  jest.mocked(confirmEmailVerification).mockResolvedValue({});
  render(<ConfirmEmailVerificationForm token={"a".repeat(43)} />);
  expect(confirmEmailVerification).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Confirmar correo electrónico" }));
  expect(confirmEmailVerification).toHaveBeenCalledTimes(1);
});
it("offers recovery for invalid and expired links", async () => {
  jest.mocked(confirmEmailVerification).mockResolvedValue({ error: "Enlace vencido" });
  render(<ConfirmEmailVerificationForm token={"a".repeat(43)} />);
  await userEvent.click(screen.getByRole("button", { name: "Confirmar correo electrónico" }));
  expect(await screen.findByText("Enlace vencido")).toBeVisible();
  expect(screen.getByRole("link", { name: "Solicitar uno nuevo" })).toHaveAttribute("href", "/auth/email-verification");
});
it("does not offer confirmation when the token is absent", () => {
  render(<ConfirmEmailVerificationForm />);
  expect(screen.getByRole("heading", { name: "Enlace inválido" })).toBeVisible();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
