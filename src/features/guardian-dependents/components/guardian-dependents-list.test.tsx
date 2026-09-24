import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@features/guardian-dependents/actions/create-guardian-dependent.action", () => ({
  createGuardianDependentAction: jest.fn(),
}));
jest.mock("@features/guardian-dependents/actions/unlink-guardian-dependent.action", () => ({
  unlinkGuardianDependentAction: jest.fn(),
}));

import { GuardianDependentsList } from "@features/guardian-dependents/components/guardian-dependents-list";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";

const INSTITUTION_ID = "019f9c3a-f891-7bc5-a98d-e65332998127";

function buildDependent(overrides: Partial<GuardianDependent> = {}): GuardianDependent {
  return {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998002",
    documentNumber: "12345678",
    firstName: "Mateo",
    lastName: "Gonzalez",
    birthDate: `${new Date().getFullYear() - 8}-01-01`,
    relationship: "MOTHER",
    isPrimaryContact: true,
    activeApplicationsCount: 2,
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("GuardianDependentsList", () => {
  it("renders each dependent with document, relationship and active applications", () => {
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByText("Mateo Gonzalez")).toBeInTheDocument();
    expect(screen.getByText(/12345678/)).toBeInTheDocument();
    expect(screen.getByText("Madre")).toBeInTheDocument();
    expect(screen.getByText("Contacto principal")).toBeInTheDocument();
    expect(screen.getByText(/2 inscripciones activas/)).toBeInTheDocument();
  });

  it("shows a dash when the birth date is unknown", () => {
    render(<GuardianDependentsList dependents={[buildDependent({ birthDate: null })]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByText(/Edad: —/)).toBeInTheDocument();
  });

  it("renders the empty state when there are no dependents", () => {
    render(<GuardianDependentsList dependents={[]} institutionId={INSTITUTION_ID} />);

    expect(
      screen.getByText("Todavía no tenés ningún estudiante a cargo registrado. Agregá a tu primer hijo para comenzar sus inscripciones."),
    ).toBeInTheDocument();
  });

  it("opens the creation dialog from the header button", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Agregar persona a cargo" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens the creation dialog from the empty state", async () => {
    const user = userEvent.setup();
    render(<GuardianDependentsList dependents={[]} institutionId={INSTITUTION_ID} />);

    await user.click(screen.getAllByRole("button", { name: "Agregar persona a cargo" })[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("links to the enrollment page for each dependent", () => {
    render(<GuardianDependentsList dependents={[buildDependent()]} institutionId={INSTITUTION_ID} />);

    expect(screen.getByRole("link", { name: "Inscribir a Mateo Gonzalez" })).toHaveAttribute(
      "href",
      "/enrollment?dependentId=019f9c3a-f891-7bc5-a98d-e65332998002",
    );
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
