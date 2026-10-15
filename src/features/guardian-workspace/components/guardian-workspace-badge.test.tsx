import { render, screen } from "@testing-library/react";

import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { GuardianWorkspaceBadge } from "@features/guardian-workspace/components/guardian-workspace-badge";

const useGuardianWorkspaceMock = jest.fn();

jest.mock("@features/guardian-workspace/components/guardian-workspace-provider", () => ({
  useGuardianWorkspace: () => useGuardianWorkspaceMock(),
}));

function buildDependent(overrides: Partial<GuardianDependent> = {}): GuardianDependent {
  return {
    personGuardianId: "019f9c3a-f891-7bc5-a98d-e65332998001",
    dependentPersonId: "019f9c3a-f891-7bc5-a98d-e65332998002",
    status: "ACTIVE",
    documentNumber: "22222222",
    firstName: "Martin",
    lastName: "Crossetin",
    birthDate: "2015-03-20",
    relationship: "FATHER",
    isPrimaryContact: true,
    activeApplicationsCount: 0,
    roles: ["Postulante"],
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("GuardianWorkspaceBadge", () => {
  it("shows the active dependent with their current role", () => {
    const dependent = buildDependent();
    useGuardianWorkspaceMock.mockReturnValue({ dependents: [dependent], activeDependent: dependent });

    render(<GuardianWorkspaceBadge />);

    expect(screen.getByText("Martin Crossetin")).toBeInTheDocument();
    expect(screen.getByText(/Postulante/)).toBeInTheDocument();
  });

  it("follows the role when it changes", () => {
    const dependent = buildDependent({ roles: ["Estudiante"] });
    useGuardianWorkspaceMock.mockReturnValue({ dependents: [dependent], activeDependent: dependent });

    render(<GuardianWorkspaceBadge />);

    expect(screen.getByText(/Estudiante/)).toBeInTheDocument();
    expect(screen.queryByText(/Postulante/)).not.toBeInTheDocument();
  });

  it("asks to select a person when none is active", () => {
    useGuardianWorkspaceMock.mockReturnValue({ dependents: [buildDependent()], activeDependent: null });

    render(<GuardianWorkspaceBadge />);

    expect(screen.getByText("Sin persona seleccionada")).toBeInTheDocument();
  });

  it("renders nothing without dependents", () => {
    useGuardianWorkspaceMock.mockReturnValue({ dependents: [], activeDependent: null });

    const { container } = render(<GuardianWorkspaceBadge />);

    expect(container).toBeEmptyDOMElement();
  });
});
