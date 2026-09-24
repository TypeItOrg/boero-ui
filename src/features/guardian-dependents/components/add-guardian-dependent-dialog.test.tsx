import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/guardian-dependents/actions/create-guardian-dependent.action", () => ({
  createGuardianDependentAction: jest.fn(),
}));

import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { AddGuardianDependentDialog } from "@features/guardian-dependents/components/add-guardian-dependent-dialog";

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";
const BIRTH_YEAR = new Date().getFullYear() - 8;

async function fillForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(/^Nombre/), "Mateo");
  await user.type(screen.getByLabelText(/^Apellido/), "Gonzalez");
  await user.type(screen.getByLabelText(/^Documento/), "12345678");
  await user.type(screen.getByRole("textbox", { name: /Fecha de nacimiento/ }), `0101${BIRTH_YEAR}`);
  await user.click(screen.getByRole("combobox", { name: /Vínculo/ }));
  await user.click(await screen.findByRole("option", { name: "Madre" }));
}

describe("AddGuardianDependentDialog", () => {
  beforeEach(() => {
    jest.mocked(createGuardianDependentAction).mockReset().mockResolvedValue({});
  });

  it("submits every field with an explicit primary contact boolean", async () => {
    const user = userEvent.setup();
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(createGuardianDependentAction).toHaveBeenCalledTimes(1));
    const [institutionId, , formData] = jest.mocked(createGuardianDependentAction).mock.calls[0];

    expect(institutionId).toBe(INSTITUTION_ID);
    expect(Object.fromEntries(formData.entries())).toEqual({
      firstName: "Mateo",
      lastName: "Gonzalez",
      documentNumber: "12345678",
      birthDate: `${BIRTH_YEAR}-01-01`,
      relationship: "MOTHER",
      isPrimaryContact: "false",
    });
  });

  it("sends isPrimaryContact as true when the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("checkbox", { name: /Contacto principal/ }));
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(createGuardianDependentAction).toHaveBeenCalled());
    expect(jest.mocked(createGuardianDependentAction).mock.calls[0][2].get("isPrimaryContact")).toBe("true");
  });

  it("shows field and general errors and stays open", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    jest.mocked(createGuardianDependentAction).mockResolvedValueOnce({
      error: "No se pudo registrar a la persona a cargo.",
      fieldErrors: { documentNumber: "El número de documento debe tener exactamente 8 dígitos." },
    });
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByText("El número de documento debe tener exactamente 8 dígitos.")).toBeInTheDocument();
    expect(screen.getByText("No se pudo registrar a la persona a cargo.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onSuccess when the dependent is created", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    jest.mocked(createGuardianDependentAction).mockResolvedValueOnce({ success: true });
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("disables its controls while the action is pending", async () => {
    const user = userEvent.setup();
    let resolveAction: (state: object) => void = () => undefined;
    jest.mocked(createGuardianDependentAction).mockImplementationOnce(() => new Promise((resolve) => (resolveAction = resolve)));
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled());
    expect(screen.getByRole("button", { name: /Agregando/ })).toBeDisabled();

    resolveAction({});
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).not.toBeDisabled());
  });

  it("falls back to a generic error when the action throws", async () => {
    const user = userEvent.setup();
    jest.mocked(createGuardianDependentAction).mockRejectedValueOnce(new Error("network"));
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(await screen.findByText("No se pudo registrar a la persona a cargo.")).toBeInTheDocument();
  });
});
