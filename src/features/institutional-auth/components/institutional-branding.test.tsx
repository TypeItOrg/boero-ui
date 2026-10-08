import { render, screen, fireEvent } from "@testing-library/react";
import { InstitutionalBrandProvider } from "@features/institutional-auth/components/institutional-brand-context";
import { InstitutionalBrandIdentity, InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";
import { InstitutionalLoginForm } from "@features/institutional-auth/components/institutional-login-form";
import { InstitutionalRegisterForm } from "@features/institutional-auth/components/institutional-register-form";
import { InstitutionalPasswordRecoveryForm } from "@features/institutional-auth/components/institutional-password-recovery-form";
import { EmailVerificationForm } from "@features/institutional-auth/components/email-verification-form";

jest.mock("@features/institutional-auth/components/institution-picker", () => ({
  InstitutionPicker: ({ id, value }: { id: string; value?: string }) => (
    <input id={id} aria-label="Institución" name="institutionId" defaultValue={value ?? ""} />
  ),
}));
jest.mock("@features/institutional-auth/actions/identify-institutional-user.action", () => ({ identifyInstitutionalUser: jest.fn() }));
jest.mock("@features/institutional-auth/actions/institutional-password-login.action", () => ({ institutionalPasswordLogin: jest.fn() }));
jest.mock("@features/institutional-auth/actions/begin-passkey-login.action", () => ({ beginPasskeyLogin: jest.fn() }));
jest.mock("@features/institutional-auth/actions/finish-passkey-login.action", () => ({ finishPasskeyLogin: jest.fn() }));
jest.mock("@features/institutional-auth/actions/consume-institutional-login-flashes.action", () => ({ consumeInstitutionalLoginFlashes: jest.fn() }));
jest.mock("@features/institutional-auth/actions/institutional-register.action", () => ({ registerInstitutional: jest.fn() }));
jest.mock("@features/institutional-auth/actions/request-institutional-password-recovery.action", () => ({ requestPasswordRecovery: jest.fn() }));
jest.mock("@features/institutional-auth/actions/email-verification.actions", () => ({
  resendEmailVerification: jest.fn(),
  changePendingEmail: jest.fn(),
}));
const institution = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Conservatorio Boero",
  publicSubdomain: "cboero",
  logoUrl: `/api/v1/institutions/22222222-2222-4222-8222-222222222222/logo?v=opaque`,
};
const forms = [InstitutionalLoginForm, InstitutionalRegisterForm, InstitutionalPasswordRecoveryForm, EmailVerificationForm];
it.each(forms)("[A01.generic-flows] existing $name keeps the institution selector", (Form) => {
  render(<Form />);
  expect(screen.getByLabelText("Institución")).toBeInTheDocument();
});
it.each(forms)("[A02.branded-mobile] $name fixes institution and exposes mobile identity without a selector", (Form) => {
  const { container } = render(
    <InstitutionalBrandProvider institution={institution}>
      <Form />
    </InstitutionalBrandProvider>,
  );
  expect(screen.queryByLabelText("Institución")).not.toBeInTheDocument();
  expect(container.querySelector('input[name="institutionId"]')).toHaveValue(institution.id);
  expect(screen.queryByText(institution.name)).not.toBeInTheDocument();
  expect(screen.getByAltText(`Logo de ${institution.name}`)).toHaveAttribute(
    "src",
    `http://localhost/api/public/institutions/${institution.id}/logo?v=opaque`,
  );
});
it("[A02.branded-desktop] desktop brand panel uses public same-origin logo without redundant institution name", () => {
  render(
    <InstitutionalBrandProvider institution={institution}>
      <InstitutionalBrandPanel />
    </InstitutionalBrandProvider>,
  );
  expect(screen.queryByText(institution.name)).not.toBeInTheDocument();
  expect(screen.getByAltText(`Logo de ${institution.name}`)).toHaveAttribute(
    "src",
    `http://localhost/api/public/institutions/${institution.id}/logo?v=opaque`,
  );
});
it("[A02.branded-desktop] desktop brand panel can optionally render institution name when explicitly requested", () => {
  render(
    <InstitutionalBrandProvider institution={institution}>
      <InstitutionalBrandPanel showInstitutionName />
    </InstitutionalBrandProvider>,
  );
  expect(screen.getByText(institution.name)).toBeInTheDocument();
});
it("[A02.no-logo] brand uses institution name only, never another institution's logo", () => {
  render(
    <InstitutionalBrandProvider institution={{ ...institution, logoUrl: null }}>
      <InstitutionalBrandIdentity />
    </InstitutionalBrandProvider>,
  );
  expect(screen.getByText(institution.name)).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it("[L03.logo-cache-fallback] broken logo falls back to name and a new opaque version is displayed", () => {
  const { rerender } = render(
    <InstitutionalBrandProvider institution={institution}>
      <InstitutionalBrandIdentity />
    </InstitutionalBrandProvider>,
  );
  fireEvent.error(screen.getByRole("img"));
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.getByText(institution.name)).toBeInTheDocument();
  rerender(
    <InstitutionalBrandProvider institution={{ ...institution, logoUrl: `${institution.logoUrl}2` }}>
      <InstitutionalBrandIdentity />
    </InstitutionalBrandProvider>,
  );
  expect(screen.getByRole("img")).toHaveProperty("src", `http://localhost/api/public/institutions/${institution.id}/logo?v=opaque2`);
});
