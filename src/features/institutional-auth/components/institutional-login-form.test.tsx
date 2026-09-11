import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
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

jest.mock("@features/institutional-auth/actions/consume-institutional-password-changed-flash.action", () => ({
  consumeInstitutionalPasswordChangedFlash: jest.fn(),
}));

import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { institutionalPasswordLogin } from "@features/institutional-auth/actions/institutional-password-login.action";
import { beginPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";
import { finishPasskeyLogin } from "@features/institutional-auth/actions/finish-passkey-login.action";

const identifyMock = jest.mocked(identifyInstitutionalUser);
const passwordMock = jest.mocked(institutionalPasswordLogin);
const beginMock = jest.mocked(beginPasskeyLogin);
const finishMock = jest.mocked(finishPasskeyLogin);

describe("InstitutionalLoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    identifyMock.mockResolvedValue({});
  });

  it("shows only institution and DNI on the initial step", () => {
    render(<InstitutionalLoginForm />);

    expect(screen.getByLabelText("Institución")).toBeInTheDocument();
    expect(screen.getByLabelText(/DNI/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "¿Olvidaste tu contraseña?" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /passkey/i })).not.toBeInTheDocument();
  });

  it("shows an explicit error for unknown accounts", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ error: "No encontramos una cuenta asociada a ese DNI en esta institución." });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/DNI/), "99999999");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("No encontramos una cuenta asociada a ese DNI en esta institución.")).toBeInTheDocument();
  });

  it("routes accounts without passkeys to the generic password step", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-1", nextStep: "PASSWORD" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/DNI/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Bienvenido de nuevo")).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar cuenta" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Usar una passkey" })).not.toBeInTheDocument();
  });

  it("routes accounts with passkeys to the passkey step without auto-opening WebAuthn", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-2", nextStep: "PASSKEY" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/DNI/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Continuá con tu passkey")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar contraseña" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar cuenta" })).toBeInTheDocument();

    await waitFor(() => expect(beginMock).not.toHaveBeenCalled());
  });

  it("drops the previous password error when identifying another account", async () => {
    const user = userEvent.setup();
    identifyMock
      .mockResolvedValueOnce({ loginAttemptId: "attempt-A", nextStep: "PASSWORD" })
      .mockResolvedValueOnce({ loginAttemptId: "attempt-B", nextStep: "PASSWORD" });
    passwordMock.mockResolvedValue({ error: "wrong password" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/DNI/), "11111111");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByText("Bienvenido de nuevo");

    await user.type(screen.getByLabelText(/Contraseña/), "wrong");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByText("wrong password")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cambiar cuenta" }));
    await user.type(screen.getByLabelText(/DNI/), "22222222");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByText("Bienvenido de nuevo");

    expect(screen.queryByText("wrong password")).not.toBeInTheDocument();
  });

  it("allows switching from passkey to password and back without re-entering the identifier", async () => {
    const user = userEvent.setup();
    identifyMock.mockResolvedValue({ loginAttemptId: "attempt-3", nextStep: "PASSKEY" });

    render(<InstitutionalLoginForm />);

    await user.type(screen.getByLabelText(/DNI/), "12345678");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByText("Continuá con tu passkey");

    await user.click(screen.getByRole("button", { name: "Usar contraseña" }));

    expect(await screen.findByText("Bienvenido de nuevo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar una passkey" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Usar una passkey" }));

    expect(await screen.findByText("Continuá con tu passkey")).toBeInTheDocument();
    expect(identifyMock).toHaveBeenCalledTimes(1);
  });

  describe("passkey ceremony lifecycle", () => {
    const validOptions = {
      challenge: "dGVzdC1jaGFsbGVuZ2U",
      rpId: "localhost",
      userVerification: "required",
      allowCredentials: [],
    };
    const fakeCredential = { toJSON: () => ({ id: "credential-id", type: "public-key" }) };
    const getMock = jest.fn();

    function deferred<T>() {
      let resolve!: (value: T) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    async function goToPasskeyStep() {
      const user = userEvent.setup();
      identifyMock.mockResolvedValue({ loginAttemptId: "attempt-9", nextStep: "PASSKEY" });
      beginMock.mockResolvedValue({ ceremonyId: "ceremony-9", options: validOptions });
      finishMock.mockResolvedValue({});
      Object.defineProperty(window, "PublicKeyCredential", { value: function () {}, configurable: true });
      Object.defineProperty(navigator, "credentials", { value: { create: jest.fn(), get: getMock }, configurable: true });

      const view = render(<InstitutionalLoginForm />);

      await user.type(screen.getByLabelText(/DNI/), "12345678");
      await user.click(screen.getByRole("button", { name: "Continuar" }));
      await screen.findByText("Continuá con tu passkey");

      return view;
    }

    function passkeyButton(): HTMLElement {
      return screen.getByRole("button", { name: /Ingresar con passkey/ });
    }

    beforeEach(() => {
      getMock.mockReset();
    });

    it("ignores a second click while a ceremony is in flight", async () => {
      await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      const button = passkeyButton();

      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(beginMock).toHaveBeenCalledTimes(1);
        expect(getMock).toHaveBeenCalledTimes(1);
      });
    });

    it("ignores a stale rejection after a newer ceremony completed", async () => {
      await goToPasskeyStep();
      const first = deferred<unknown>();
      getMock.mockReturnValueOnce(first.promise);
      fireEvent.click(passkeyButton());
      await screen.findByText("Esperando tu passkey...");

      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(await screen.findByRole("button", { name: /Ingresar con passkey/ })).toBeInTheDocument();

      getMock.mockResolvedValueOnce(fakeCredential);
      finishMock.mockResolvedValueOnce({ error: "second-error" });
      fireEvent.click(passkeyButton());
      expect(await screen.findByText("second-error")).toBeInTheDocument();

      first.reject(new Error("stale-error"));

      await waitFor(() => expect(screen.getByText("second-error")).toBeInTheDocument());
      expect(screen.queryByText(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED)).not.toBeInTheDocument();
    });

    it.each([
      ["NotAllowedError", new DOMException("cancelled", "NotAllowedError")],
      ["AbortError", new DOMException("aborted", "AbortError")],
    ])("stays silent on %s without leaving a spinner", async (_, error) => {
      await goToPasskeyStep();
      getMock.mockRejectedValueOnce(error);

      fireEvent.click(passkeyButton());

      await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.queryByText("Esperando tu passkey...")).not.toBeInTheDocument());
      expect(screen.queryByText("¡Ups! Algo salió mal")).not.toBeInTheDocument();
      expect(passkeyButton()).toBeEnabled();
    });

    it("aborts the pending ceremony when switching to password", async () => {
      await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await screen.findByText("Esperando tu passkey...");

      const signal = getMock.mock.calls[0][0].signal as AbortSignal | undefined;
      expect(signal).toBeInstanceOf(AbortSignal);

      fireEvent.click(screen.getByRole("button", { name: "Usar contraseña" }));

      expect(signal?.aborted).toBe(true);
      expect(await screen.findByText("Bienvenido de nuevo")).toBeInTheDocument();
      expect(screen.queryByText("Esperando tu passkey...")).not.toBeInTheDocument();
    });

    it("aborts the pending ceremony when changing account", async () => {
      await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await screen.findByText("Esperando tu passkey...");

      const signal = getMock.mock.calls[0][0].signal as AbortSignal | undefined;

      fireEvent.click(screen.getByRole("button", { name: "Cambiar cuenta" }));

      expect(signal?.aborted).toBe(true);
      expect(await screen.findByLabelText(/DNI/)).toBeInTheDocument();
    });

    it("aborts the pending ceremony on unmount", async () => {
      const boundScreen = await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await screen.findByText("Esperando tu passkey...");

      const signal = getMock.mock.calls[0][0].signal as AbortSignal | undefined;
      expect(signal?.aborted).toBe(false);

      boundScreen.unmount();

      expect(signal?.aborted).toBe(true);
    });

    it("shows no error flash on a successful ceremony", async () => {
      await goToPasskeyStep();
      getMock.mockResolvedValue(fakeCredential);
      finishMock.mockResolvedValue({});

      fireEvent.click(passkeyButton());

      await waitFor(() => expect(finishMock).toHaveBeenCalled());
      expect(screen.queryByText("¡Ups! Algo salió mal")).not.toBeInTheDocument();
    });
  });
});
