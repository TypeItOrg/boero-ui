import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PasskeyManager } from "@features/institutional-auth/components/passkey-manager";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock("@features/institutional-auth/actions/passkey-registration.actions", () => ({
  requestPasskeyRegistration: jest.fn(),
  verifyPasskeyRegistrationAction: jest.fn(),
}));

jest.mock("@features/institutional-auth/actions/passkey-management.actions", () => ({
  renamePasskeyAction: jest.fn(),
  revokePasskeyAction: jest.fn(),
  reAuthenticateAction: jest.fn(),
}));

import { requestPasskeyRegistration, verifyPasskeyRegistrationAction } from "@features/institutional-auth/actions/passkey-registration.actions";
import { renamePasskeyAction } from "@features/institutional-auth/actions/passkey-management.actions";
import type { Passkey } from "@features/institutional-auth/types/passkey.types";

const requestMock = jest.mocked(requestPasskeyRegistration);
const verifyMock = jest.mocked(verifyPasskeyRegistrationAction);
const renameMock = jest.mocked(renamePasskeyAction);
const createMock = jest.fn();

const validOptions = {
  rp: { id: "localhost", name: "Boero" },
  user: { id: "dGVzdA", name: "user", displayName: "User" },
  challenge: "dGVzdC1jaGFsbGVuZ2U",
  pubKeyCredParams: [],
  excludeCredentials: [],
};

describe("PasskeyManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requestMock.mockResolvedValue({ ceremonyId: "ceremony-1", options: validOptions });
    verifyMock.mockResolvedValue({});
    renameMock.mockResolvedValue({ success: true });
    Object.defineProperty(window, "PublicKeyCredential", { value: function () {}, configurable: true });
    Object.defineProperty(navigator, "credentials", { value: { create: createMock, get: jest.fn() }, configurable: true });
  });

  function renderManager(passkeys: Passkey[] = []): void {
    render(<PasskeyManager initialPasskeys={passkeys} maxActivePasskeys={10} />);
  }

  it("aborts the pending creation when cancelling and recovers the dialog", async () => {
    const user = userEvent.setup();
    createMock.mockReturnValue(new Promise(() => {}));
    renderManager();

    await user.click(screen.getByRole("button", { name: "Añadir passkey" }));
    await user.type(screen.getByLabelText(/Nombre/), "Mi PC");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Registrando...")).toBeInTheDocument();

    const signal = createMock.mock.calls[0][0].signal as AbortSignal | undefined;
    expect(signal).toBeInstanceOf(AbortSignal);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(signal?.aborted).toBe(true);
    await waitFor(() => expect(screen.queryByText("Registrando...")).not.toBeInTheDocument());
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(verifyMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Añadir passkey" })).toBeInTheDocument();
  });

  it("ignores a stale creation rejection after cancelling and starting over", async () => {
    const user = userEvent.setup();
    let rejectFirst!: (reason?: unknown) => void;
    createMock.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectFirst = reject;
      }),
    );
    renderManager();

    await user.click(screen.getByRole("button", { name: "Añadir passkey" }));
    await user.type(screen.getByLabelText(/Nombre/), "Mi PC");
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await screen.findByText("Registrando...");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    rejectFirst(new Error("stale-error"));

    await waitFor(() => expect(screen.queryByText("Registrando...")).not.toBeInTheDocument());
    expect(screen.queryByText("No se pudo registrar la passkey.")).not.toBeInTheDocument();
  });

  it("disables adding and explains why when the browser cannot create passkeys", async () => {
    Object.defineProperty(window, "PublicKeyCredential", { value: undefined, configurable: true });
    renderManager();

    expect(screen.getByRole("button", { name: "Añadir passkey" })).toBeDisabled();
    expect(screen.getByText(/no puede crear passkeys/)).toBeInTheDocument();
  });

  it("shows the backend-provided passkey limit", () => {
    render(<PasskeyManager initialPasskeys={[{ id: "1", label: "Mi PC", createdAt: null, lastUsedAt: null }]} maxActivePasskeys={5} />);

    expect(screen.getByText("1 de 5 passkeys en uso.")).toBeInTheDocument();
  });

  it("ignores a second rename submit while one is in flight", async () => {
    const user = userEvent.setup();
    let resolveRename!: (value: { success: true }) => void;
    renameMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRename = resolve;
      }),
    );
    renderManager([{ id: "1", label: "Mi PC", createdAt: null, lastUsedAt: null }]);

    await user.click(screen.getByRole("button", { name: "Renombrar" }));
    await user.clear(screen.getByLabelText(/Nombre/));
    await user.type(screen.getByLabelText(/Nombre/), "Nueva");
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    resolveRename({ success: true });

    await waitFor(() => expect(renameMock).toHaveBeenCalledTimes(1));
  });
});
