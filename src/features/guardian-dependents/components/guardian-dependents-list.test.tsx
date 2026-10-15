import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GuardianDependentsList } from "@features/guardian-dependents/components/guardian-dependents-list";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import type { GuardianDependentsQuery } from "@features/guardian-dependents/types/guardian-dependents-query.types";

const mockNavigate = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
  usePathname: () => "/my-dependents",
  useSearchParams: () => new URLSearchParams("sortField=lastName&sortDirection=asc"),
}));
jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ navigate: mockNavigate, isPending: false }),
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

function renderList(items: GuardianDependent[], overrides: Partial<GuardianDependentsQuery> = {}, totalItems = items.length): void {
  const query: GuardianDependentsQuery = {
    page: 0,
    size: 10,
    search: "",
    sort: { field: "createdAt", direction: "desc" },
    ...overrides,
  };

  render(
    <GuardianDependentsList
      institutionId={INSTITUTION_ID}
      query={query}
      data={{ items, page: query.page, size: query.size, totalItems, totalPages: Math.ceil(totalItems / query.size) }}
    />,
  );
}

describe("GuardianDependentsList", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPush.mockClear();
  });

  it("renders separate names, document, relationship and active applications", () => {
    renderList([buildDependent()]);
    expect(screen.getByRole("cell", { name: "Mateo" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Gonzalez" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "12345678" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "8 años" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Madre" })).toBeInTheDocument();
    expect(screen.getByText("2 inscripciones activas")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")[0]).toHaveAccessibleName("Acciones");
  });

  it("shows approved actions in the leading contextual menu", async () => {
    const user = userEvent.setup();
    renderList([buildDependent()]);
    await user.click(screen.getByRole("button", { name: "Abrir acciones de Mateo Gonzalez" }));
    expect(screen.getByRole("menuitem", { name: "Inscribir" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Quitar vinculación" })).toBeInTheDocument();
  });

  it("shows pending details inside the status pill and permits cancellation only", async () => {
    const user = userEvent.setup();
    renderList([buildDependent({ status: "PENDING", activeApplicationsCount: 0, roles: [] })]);
    expect(screen.getByText("Sin inscripciones")).toHaveClass("text-muted-foreground", "italic");
    expect(screen.queryByText(/La institución todavía/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Ver detalle del estado/ }));
    expect(screen.getByText(/La institución todavía/)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.pointer({ keys: "[MouseRight]", target: screen.getByRole("cell", { name: "Mateo" }) });
    expect(screen.getByRole("menuitem", { name: "Cancelar solicitud" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Inscribir" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Cancelar solicitud" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("La institución ya no podrá aprobar esta solicitud");
    expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
  });

  it("shows a rejected link without management actions or invented names", () => {
    renderList([buildDependent({ status: "REJECTED", firstName: null, lastName: null, activeApplicationsCount: 0, roles: [] })]);
    expect(screen.getByRole("button", { name: /Ver detalle del estado: Rechazada/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Abrir acciones/ })).not.toBeInTheDocument();
    const row = screen.getAllByRole("row")[1];
    expect(within(row).getAllByRole("cell")[1]).toHaveTextContent("Nombre no informado");
    expect(within(row).getAllByRole("cell")[2]).toHaveTextContent("Apellido no informado");
  });

  it("shows whether the guardian is the primary contact", () => {
    renderList([buildDependent({ isPrimaryContact: false })]);
    expect(screen.getByRole("cell", { name: "No" })).toBeInTheDocument();
  });

  it("shows an explicit fallback when the birth date is unknown", () => {
    renderList([buildDependent({ birthDate: null })]);
    expect(screen.getByRole("cell", { name: "Edad no informada" })).toBeInTheDocument();
  });

  it("renders the empty state when there are no dependents", () => {
    renderList([]);
    expect(screen.getByText("No hay personas a cargo")).toBeInTheDocument();
  });

  it("sends search changes to server navigation instead of filtering the current page", async () => {
    const user = userEvent.setup();
    renderList([buildDependent()]);
    await user.type(screen.getByRole("textbox", { name: /^Buscar/ }), "sofia");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ search: "sofia", page: "0", size: "10" }, { replace: true }));
  });

  it("starts with the server search and sends sort changes to page zero", async () => {
    const user = userEvent.setup();
    renderList([buildDependent()], { search: "12345678" });
    expect(screen.getByRole("textbox", { name: /^Buscar/ })).toHaveValue("12345678");
    await user.click(screen.getByRole("button", { name: /Ordenar por Apellido/ }));
    expect(mockNavigate).toHaveBeenCalledWith({ page: "0", sortField: "lastName", sortDirection: "asc" });
  });

  it("shows a filtered empty state and can clear the search", async () => {
    const user = userEvent.setup();
    renderList([], { search: "zzz" });
    expect(screen.getByText("No se encontraron personas a cargo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith({ search: "", page: "0", size: "10" }, { replace: true }));
  });

  it("links to the request page from the collection action", async () => {
    renderList([buildDependent()]);
    expect(screen.getByRole("link", { name: "Solicitar vinculación" })).toHaveAttribute(
      "href",
      "/my-dependents/new?returnTo=%2Fmy-dependents%3FsortField%3DlastName%26sortDirection%3Dasc",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("links to the request page from an empty collection", async () => {
    renderList([]);
    expect(screen.getByRole("link", { name: "Solicitar vinculación" })).toHaveAttribute(
      "href",
      "/my-dependents/new?returnTo=%2Fmy-dependents%3FsortField%3DlastName%26sortDirection%3Dasc",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("selects the dependent workspace before starting enrollment", async () => {
    const user = userEvent.setup();
    renderList([buildDependent()]);
    await user.click(screen.getByRole("button", { name: "Abrir acciones de Mateo Gonzalez" }));
    await user.click(screen.getByRole("menuitem", { name: "Inscribir" }));
    const { setGuardianWorkspaceAction } = await import("@features/guardian-workspace/actions/set-guardian-workspace.action");
    await waitFor(() => expect(setGuardianWorkspaceAction).toHaveBeenCalledWith("019f9c3a-f891-7bc5-a98d-e65332998002"));
  });

  it("opens the unlink confirmation for the chosen dependent and can dismiss it", async () => {
    const user = userEvent.setup();
    renderList([buildDependent()]);
    await user.click(screen.getByRole("button", { name: "Abrir acciones de Mateo Gonzalez" }));
    await user.click(screen.getByRole("menuitem", { name: "Quitar vinculación" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Mateo Gonzalez");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
