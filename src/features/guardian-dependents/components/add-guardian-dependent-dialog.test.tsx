import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { AddGuardianDependentDialog } from "@features/guardian-dependents/components/add-guardian-dependent-dialog";

jest.mock("@features/guardian-dependents/actions/create-guardian-dependent.action", () => ({
  createGuardianDependentAction: jest.fn(),
}));

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
    expect(screen.getByText(`${new Date().getFullYear() - BIRTH_YEAR} años`)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Solicitar" }));

    await waitFor(() => expect(createGuardianDependentAction).toHaveBeenCalledTimes(1));
    const [institutionId, , formData] = jest.mocked(createGuardianDependentAction).mock.calls[0];

    expect(institutionId).toBe(INSTITUTION_ID);
    // A browser always sends the file input, empty when nothing was chosen.
    expect(formData.getAll("documents").every((document) => document instanceof File && document.size === 0)).toBe(true);
    formData.delete("documents");
    expect(Object.fromEntries(formData.entries())).toEqual({
      firstName: "Mateo",
      lastName: "Gonzalez",
      documentNumber: "12345678",
      birthDate: `${BIRTH_YEAR}-01-01`,
      relationship: "MOTHER",
      isPrimaryContact: "false",
    });
  });

  it("sends the chosen supporting documents", async () => {
    const user = userEvent.setup();
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await fillForm(user);
    const input = screen.getByLabelText(/Documentación respaldatoria/) as HTMLInputElement;
    await user.upload(input, new File(["%PDF-1.4"], "partida.pdf", { type: "application/pdf" }));
    expect(input.files?.[0].name).toBe("partida.pdf");
    await user.click(screen.getByRole("button", { name: "Solicitar" }));

    await waitFor(() => expect(createGuardianDependentAction).toHaveBeenCalled());
    const documents = jest.mocked(createGuardianDependentAction).mock.calls[0][2].getAll("documents");
    expect(documents).toHaveLength(1);
    // jsdom and Node's FormData do not share File, so the content is not checkable here.
  });

  it("explains that the request stays pending until the institution validates it", () => {
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    expect(screen.getByText(/pendiente de validación/i)).toBeInTheDocument();
  });

  it("sends isPrimaryContact as true when the checkbox is checked", async () => {
    const user = userEvent.setup();
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("checkbox", { name: /Contacto principal/ }));
    await user.click(screen.getByRole("button", { name: "Solicitar" }));

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

    await user.click(screen.getByRole("button", { name: "Solicitar" }));

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

    await user.click(screen.getByRole("button", { name: "Solicitar" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("disables its controls while the action is pending", async () => {
    const user = userEvent.setup();
    let resolveAction: (state: object) => void = () => undefined;
    jest.mocked(createGuardianDependentAction).mockImplementationOnce(() => new Promise((resolve) => (resolveAction = resolve)));
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Solicitar" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled());
    expect(screen.getByRole("button", { name: /Enviando/ })).toBeDisabled();

    resolveAction({});
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).not.toBeDisabled());
  });

  it("falls back to a generic error when the action throws", async () => {
    const user = userEvent.setup();
    jest.mocked(createGuardianDependentAction).mockRejectedValueOnce(new Error("network"));
    render(<AddGuardianDependentDialog institutionId={INSTITUTION_ID} onClose={jest.fn()} onSuccess={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Solicitar" }));

    expect(await screen.findByText("No se pudo registrar a la persona a cargo.")).toBeInTheDocument();
  });
});
