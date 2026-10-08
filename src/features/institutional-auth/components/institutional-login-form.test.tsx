import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { beginInstitutionalPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";
import { institutionalCredentialsLogin } from "@features/institutional-auth/actions/institutional-credentials-login.action";
import { InstitutionalLoginForm } from "@features/institutional-auth/components/institutional-login-form";

jest.mock("@features/institutional-auth/components/institution-picker", () => ({
  InstitutionPicker: () => <input name="institutionId" defaultValue="inst-1" aria-label="Institución" />,
}));
jest.mock("@features/institutional-auth/actions/institutional-credentials-login.action", () => ({
  institutionalCredentialsLogin: jest.fn(),
}));
jest.mock("@features/institutional-auth/actions/begin-passkey-login.action", () => ({
  beginInstitutionalPasskeyLogin: jest.fn(),
}));
jest.mock("@features/institutional-auth/actions/finish-passkey-login.action", () => ({
  finishPasskeyLogin: jest.fn(),
}));
jest.mock("@features/institutional-auth/actions/consume-institutional-login-flashes.action", () => ({
  consumeInstitutionalLoginFlashes: jest.fn(),
}));

const credentialsMock = jest.mocked(institutionalCredentialsLogin);
const beginMock = jest.mocked(beginInstitutionalPasskeyLogin);

describe("InstitutionalLoginForm", () => {
  beforeEach(() => {
    credentialsMock.mockReset().mockResolvedValue({});
    beginMock.mockReset();
  });

  it("shows credentials and an explicit passkey option on the initial step", () => {
    render(<InstitutionalLoginForm />);

    expect(screen.getByLabelText("Institución")).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar una llave de acceso" })).toBeInTheDocument();
    expect(beginMock).not.toHaveBeenCalled();
  });

  it("shows the authentication error returned by the credentials action", async () => {
    const user = userEvent.setup();
    credentialsMock.mockResolvedValue({ error: "Documento o contraseña incorrectos." });
    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "99999999");
    await user.type(screen.getByLabelText(/Contraseña/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(await screen.findByText("Documento o contraseña incorrectos.")).toBeInTheDocument();
  });

  it("submits the institution, document and password directly without an identification step", async () => {
    const user = userEvent.setup();
    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.type(screen.getByLabelText(/Contraseña/), "secret-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    await screen.findByRole("button", { name: "Iniciar sesión" });

    expect(credentialsMock).toHaveBeenCalledTimes(1);
    const form = credentialsMock.mock.calls[0][1];
    expect(form.get("institutionId")).toBe("inst-1");
    expect(form.get("documentNumber")).toBe("12345678");
    expect(form.get("password")).toBe("secret-password");
    expect(beginMock).not.toHaveBeenCalled();
  });

  it("switches to passkeys without automatically opening WebAuthn", async () => {
    const user = userEvent.setup();
    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.click(screen.getByRole("button", { name: "Usar una llave de acceso" }));

    expect(await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar contraseña" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Contraseña/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toBeEnabled();
    expect(beginMock).not.toHaveBeenCalled();
  });

  it("drops the previous password error when changing the account document", async () => {
    const user = userEvent.setup();
    credentialsMock.mockResolvedValue({ error: "wrong password" });
    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "11111111");
    await user.type(screen.getByLabelText(/Contraseña/), "wrong");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByText("wrong password")).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Documento/));
    await user.type(screen.getByLabelText(/Documento/), "22222222");

    expect(screen.queryByText("wrong password")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
  });

  it("allows switching from passkey to password and back without re-entering the identifier", async () => {
    const user = userEvent.setup();
    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/Documento/), "12345678");
    await user.click(screen.getByRole("button", { name: "Usar una llave de acceso" }));
    await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" });
    await user.click(screen.getByRole("button", { name: "Usar contraseña" }));

    expect(await screen.findByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toHaveValue("12345678");
    await user.click(screen.getByRole("button", { name: "Usar una llave de acceso" }));

    expect(await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento/)).toHaveValue("12345678");
    expect(credentialsMock).not.toHaveBeenCalled();
    expect(beginMock).not.toHaveBeenCalled();
  });
});
