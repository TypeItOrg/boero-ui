import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InstitutionalLoginForm } from "@features/institutional-auth/components/institutional-login-form";

jest.mock("@features/institutional-auth/components/institution-picker", () => ({
  InstitutionPicker: () => <input name="institutionId" defaultValue="inst-1" aria-label="Institución" />,
}));

jest.mock("@features/institutional-auth/actions/identify-institutional-user.action", () => ({
  identifyInstitutionalUser: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/institutional-password-login.action", () => ({
  institutionalPasswordLogin: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/begin-passkey-login.action", () => ({
  beginPasskeyLogin: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/finish-passkey-login.action", () => ({
  finishPasskeyLogin: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/consume-institutional-login-flashes.action", () => ({
  consumeInstitutionalLoginFlashes: jest.fn(),
}));

import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { institutionalPasswordLogin } from "@features/institutional-auth/actions/institutional-password-login.action";
import { beginPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";

const identifyMock = jest.mocked(identifyInstitutionalUser);
const passwordMock = jest.mocked(institutionalPasswordLogin);
const beginMock = jest.mocked(beginPasskeyLogin);

describe("InstitutionalLoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    identifyMock.mockResolvedValue({});
  });

  it("shows only institution and Documento on the initial step", () => {
    render(<InstitutionalLoginForm />);

    expect(screen.getByLabelText("Institución")).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "¿Olvidaste tu contraseña?" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /llave de acceso/i })).not.toBeInTheDocument();
  });

  it("shows an explicit error for unknown accounts", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ error: "No encontramos una cuenta asociada a ese documento en esta institución." });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "99999999");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("No encontramos una cuenta asociada a ese documento en esta institución.")).toBeInTheDocument();
  });

  it("routes accounts without passkeys to the generic password step", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-1", nextStep: "PASSWORD" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Usar una llave de acceso" })).not.toBeInTheDocument();
  });

  it("routes accounts with passkeys to the passkey step without auto-opening WebAuthn", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-2", nextStep: "PASSKEY" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar contraseña" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toBeEnabled();

    await waitFor(() => expect(beginMock).not.toHaveBeenCalled());
  });

  it("drops the previous password error when identifying another account", async () => {
    const user = userEvent.setup();
    identifyMock
      .mockResolvedValueOnce({ loginAttemptId: "attempt-A", nextStep: "PASSWORD" })
      .mockResolvedValueOnce({ loginAttemptId: "attempt-B", nextStep: "PASSWORD" });
    passwordMock.mockResolvedValue({ error: "wrong password" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "11111111");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByLabelText(/Contraseña/);

    await user.type(screen.getByLabelText(/Contraseña/), "wrong");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByText("wrong password")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Documento/));
    await user.type(screen.getByLabelText(/Documento/), "22222222");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByLabelText(/Contraseña/);

    expect(screen.queryByText("wrong password")).not.toBeInTheDocument();
  });

  it("allows switching from passkey to password and back without re-entering the identifier", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-3", nextStep: "PASSKEY" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" });

    await user.click(screen.getByRole("button", { name: "Usar contraseña" }));

    expect(await screen.findByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar una llave de acceso" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Usar una llave de acceso" }));

    expect(await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" })).toBeInTheDocument();
    expect(identifyMock).toHaveBeenCalledTimes(1);
  });
});
