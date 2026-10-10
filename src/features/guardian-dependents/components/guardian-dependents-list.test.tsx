import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GuardianDependentsList } from "@features/guardian-dependents/components/guardian-dependents-list";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@features/guardian-dependents/actions/create-guardian-dependent.action", () => ({
  createGuardianDependentAction: jest.fn(),
}));
jest.mock("@features/guardian-dependents/actions/unlink-guardian-dependent.action", () => ({
  unlinkGuardianDependentAction: jest.fn(),
}));
jest.mock("@features/guardian-workspace/actions/set-guardian-workspace.action", () => ({
  setGuardianWorkspaceAction: jest.fn().mockResolvedValue({ success: true }),
}));

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";

function buildDependent(overrides: Partial<GuardianDependent> = {}): GuardianDependent {
  return {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998002",
    status: "ACTIVE",
    documentNumber: "12345678",
    firstName: "Mateo",
    lastName: "Gonzalez",
    birthDate: `${new Date().getFullYear() - 8}-01-01`,
    relationship: "MOTHER",
    isPrimaryContact: true,
    activeApplicationsCount: 2,
    roles: ["Postulante"],
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("GuardianDependentsList", () => {
  it("renders each dependent with document, relationship and active applications", () => {
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByText("Mateo Gonzalez")).toBeInTheDocument();
    expect(screen.getByText("DNI")).toBeInTheDocument();
    expect(screen.getByText("12345678")).toBeInTheDocument();
    expect(screen.getByText("Edad")).toBeInTheDocument();
    expect(screen.getByText("8 años")).toBeInTheDocument();
    expect(screen.getByText("Tu vínculo")).toBeInTheDocument();
    expect(screen.getByText("Madre")).toBeInTheDocument();
    expect(screen.getByText("Sos su contacto principal")).toBeInTheDocument();
    expect(screen.getByText(/2 inscripciones activas/)).toBeInTheDocument();
  });

  it("shows the approved status and lets the tutor enroll or remove the person", () => {
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByText("Aprobada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inscribir a Mateo Gonzalez" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar a Mateo Gonzalez" })).toBeInTheDocument();
  });

  it("shows a pending link with a cancellation action", () => {
    render(
      <GuardianDependentsList
        dependents={[buildDependent({ status: "PENDING", firstName: null, lastName: null, activeApplicationsCount: 0, roles: [] })]}
        institutionId={INSTITUTION_ID}
      />,
    );

    expect(screen.getByText("Pendiente de validación")).toBeInTheDocument();
    expect(screen.getByText("DNI 12345678")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar a DNI 12345678" })).toHaveTextContent("Cancelar solicitud");
    expect(screen.queryByRole("button", { name: /Inscribir a/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/inscripci[oó]n(es)? activa/)).not.toBeInTheDocument();
  });

  it("shows a rejected link without actions", () => {
    render(
      <GuardianDependentsList
        dependents={[buildDependent({ status: "REJECTED", firstName: null, lastName: null, activeApplicationsCount: 0, roles: [] })]}
        institutionId={INSTITUTION_ID}
      />,
    );

    expect(screen.getByText("Rechazada")).toBeInTheDocument();
    expect(screen.getByText("DNI 12345678")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Inscribir a/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Quitar a/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/inscripci[oó]n(es)? activa/)).not.toBeInTheDocument();
  });

  it("omits the primary contact line when the guardian is not the primary contact", () => {
    render(<GuardianDependentsList dependents={[buildDependent({ isPrimaryContact: false })]} institutionId={INSTITUTION_ID} />);

    expect(screen.queryByText("Sos su contacto principal")).not.toBeInTheDocument();
  });

  it("shows a dash when the birth date is unknown", () => {
    render(<GuardianDependentsList dependents={[buildDependent({ birthDate: null })]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByRole("cell", { name: "—" })).toBeInTheDocument();
  });

  it("renders the empty state when there are no dependents", () => {
    render(<GuardianDependentsList dependents={[]} institutionId={INSTITUTION_ID} />);

    expect(
      screen.getByText("Todavía no tenés ninguna persona a cargo. Solicitá la vinculación con tu primera persona para comenzar sus inscripciones."),
    ).toBeInTheDocument();
  });

  it("filters dependents by name (ignoring case and accents) or DNI", async () => {
    const user = userEvent.setup();
    const dependents = [
      buildDependent(),
      buildDependent({ personGuardianId: "g2", dependentPersonId: "d2", firstName: "Sofía", lastName: "Pérez", documentNumber: "87654321" }),
    ];
    render(<GuardianDependentsList dependents={dependents} institutionId={INSTITUTION_ID} />);
    const search = screen.getByRole("textbox", { name: "Buscar por nombre o DNI" });

    await user.type(search, "sofia");
    expect(screen.queryByText("Mateo Gonzalez")).not.toBeInTheDocument();
    expect(screen.getByText("Sofía Pérez")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "1234");
    expect(screen.getByText("Mateo Gonzalez")).toBeInTheDocument();
    expect(screen.queryByText("Sofía Pérez")).not.toBeInTheDocument();
  });

  it("starts filtered when an initial search is provided", () => {
    const dependents = [
      buildDependent(),
      buildDependent({ personGuardianId: "g2", dependentPersonId: "d2", firstName: "Sofía", lastName: "Pérez", documentNumber: "87654321" }),
    ];
    render(<GuardianDependentsList dependents={dependents} initialSearch="87654321" institutionId={INSTITUTION_ID} />);

    expect(screen.getByRole("textbox", { name: "Buscar por nombre o DNI" })).toHaveValue("87654321");
    expect(screen.getByText("Sofía Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Mateo Gonzalez")).not.toBeInTheDocument();
  });

  it("shows a no-results message and can clear the search", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    await user.type(screen.getByRole("textbox", { name: "Buscar por nombre o DNI" }), "zzz");
    expect(screen.getByText("No encontramos personas a cargo que coincidan con tu búsqueda.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByText("Mateo Gonzalez")).toBeInTheDocument();
  });

  it("opens the creation dialog from the header button", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Solicitar vinculación" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the creation dialog from the empty state", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[]} institutionId={INSTITUTION_ID} />);

    await user.click(screen.getAllByRole("button", { name: "Solicitar vinculación" })[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("selects the dependent workspace before starting enrollment", async () => {
    const user = userEvent.setup();

    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    await user.click(screen.getByRole("button", { name: "Inscribir a Mateo Gonzalez" }));

    const { setGuardianWorkspaceAction } = await import("@features/guardian-workspace/actions/set-guardian-workspace.action");
    expect(setGuardianWorkspaceAction).toHaveBeenCalledWith("019f9c3a-f891-7bc5-a98d-e65332998002");
  });

  it("opens the unlink confirmation for the chosen dependent and can dismiss it", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quitar a Mateo Gonzalez" }));

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Mateo Gonzalez");

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
