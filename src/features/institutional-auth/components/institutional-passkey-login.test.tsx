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

jest.mock("@features/institutional-auth/actions/consume-institutional-login-flashes.action", () => ({
  consumeInstitutionalLoginFlashes: jest.fn(),
}));

import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { beginPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";
import { finishPasskeyLogin } from "@features/institutional-auth/actions/finish-passkey-login.action";

const identifyMock = jest.mocked(identifyInstitutionalUser);
const beginMock = jest.mocked(beginPasskeyLogin);
const finishMock = jest.mocked(finishPasskeyLogin);

describe("InstitutionalLoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    identifyMock.mockResolvedValue({});
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

      await user.type(screen.getByLabelText(/Documento/), "12345678");
      await user.click(screen.getByRole("button", { name: "Continuar" }));
      await screen.findByRole("heading", { name: "Ingresá con tu llave de acceso" });

      return view;
    }

    function passkeyButton(): HTMLElement {
      return screen.getByRole("button", { name: /^Continuar$/ });
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
      await waitFor(() => expect(getMock).toHaveBeenCalled());

      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(await screen.findByRole("button", { name: /^Continuar$/ })).toBeInTheDocument();

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
      await waitFor(() => expect(passkeyButton()).toHaveAttribute("aria-busy", "false"));
      expect(screen.queryByText("¡Ups! Algo salió mal")).not.toBeInTheDocument();
      expect(passkeyButton()).toBeEnabled();
    });

    it("allows switching to password after cancelling the pending ceremony", async () => {
      await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await waitFor(() => expect(getMock).toHaveBeenCalled());

      const signal = getMock.mock.calls[0][0].signal as AbortSignal | undefined;
      expect(signal).toBeInstanceOf(AbortSignal);

      fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
      fireEvent.click(screen.getByRole("button", { name: "Usar contraseña" }));

      expect(signal?.aborted).toBe(true);
      expect(await screen.findByLabelText(/Contraseña/)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^Continuar$/ })).not.toBeInTheDocument();
    });

    it("aborts the pending ceremony when changing account", async () => {
      await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await waitFor(() => expect(getMock).toHaveBeenCalled());

      const signal = getMock.mock.calls[0][0].signal as AbortSignal | undefined;

      fireEvent.change(screen.getByLabelText(/Documento/), { target: { value: "87654321" } });

      expect(signal?.aborted).toBe(true);
      expect(await screen.findByLabelText(/Documento/)).toBeInTheDocument();
    });

    it("aborts the pending ceremony on unmount", async () => {
      const boundScreen = await goToPasskeyStep();
      getMock.mockReturnValue(new Promise(() => {}));
      fireEvent.click(passkeyButton());
      await waitFor(() => expect(getMock).toHaveBeenCalled());

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

    it("swallows NEXT_REDIRECT without flashing a passkey error", async () => {
      await goToPasskeyStep();
      getMock.mockResolvedValue(fakeCredential);
      const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
        digest: "NEXT_REDIRECT;push;/;307;",
      });
      finishMock.mockRejectedValueOnce(redirectError);

      fireEvent.click(passkeyButton());

      await waitFor(() => expect(finishMock).toHaveBeenCalled());
      await waitFor(() => expect(passkeyButton()).toHaveAttribute("aria-busy", "true"));
      expect(screen.queryByText("¡Ups! Algo salió mal")).not.toBeInTheDocument();
      expect(screen.queryByText(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED)).not.toBeInTheDocument();
    });
  });
});
