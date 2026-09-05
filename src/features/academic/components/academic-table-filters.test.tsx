import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@common/components/ui/async-dropdown", () => ({
  AsyncDropdown: jest.fn(() => null),
}));

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";

const mockNavigate = jest.fn();

jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ isPending: false, navigate: mockNavigate }),
}));

describe("AcademicTableFilters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    jest.mocked(AsyncDropdown).mockClear();
  });

  it("uses the resource-specific placeholder for the general search", () => {
    const { container } = render(
      <AcademicTableFilters
        dateFilters={[]}
        filters={[]}
        search="2026"
        searchPlaceholder="Buscar por año, fecha o estado..."
        searchable
        size={10}
        yearFilters={[]}
      />,
    );

    expect(screen.getByPlaceholderText("Buscar por año, fecha o estado...")).toHaveValue("2026");
    expect(container.querySelector("form")).toHaveClass("flex", "flex-wrap");
  });

  it("scopes the training-path option cache to the academic context", () => {
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";

    render(
      <AcademicTableFilters
        dateFilters={[]}
        filters={[]}
        search=""
        searchable={false}
        size={10}
        trainingPathFilter={{
          institutionId,
          scope: "institutional",
          selectedLabel: undefined,
          value: undefined,
        }}
        yearFilters={[]}
      />,
    );

    expect(jest.mocked(AsyncDropdown).mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        queryKey: ["academic", "study-plans", "training-path-filter", "institutional", institutionId],
      }),
    );
  });

  it("keeps primary course filters visible and moves secondary ones into the advanced dialog", async () => {
    const user = userEvent.setup();
    const institutionId = "05b84ac4-66aa-409f-a813-012d15b8cb9b";

    render(
      <AcademicTableFilters
        academicSpaceFilter={{ institutionId, scope: "institutional", selectedLabel: undefined, value: undefined }}
        activeAdvancedCount={0}
        advancedSelectFilters={[
          {
            defaultValue: "false",
            label: "Registros",
            name: "deleted",
            options: [
              { value: "false", label: "Vigentes" },
              { value: "true", label: "Eliminados" },
            ],
            value: "false",
          },
        ]}
        cycleFilter={{ institutionId, scope: "institutional", selectedLabel: undefined, value: undefined }}
        dateFilters={[]}
        filters={[
          {
            defaultValue: "all",
            label: "Estado",
            name: "courseStatus",
            options: [
              { value: "all", label: "Todos" },
              { value: "ACTIVE", label: "Activo" },
            ],
            value: "ACTIVE",
          },
        ]}
        search=""
        searchable
        size={10}
        studyPlanFilter={{ institutionId, scope: "institutional", selectedLabel: undefined, value: undefined }}
        yearFilters={[]}
      />,
    );

    expect(screen.getByText("Ciclo lectivo")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.queryByText("Plan de estudio")).not.toBeInTheDocument();
    expect(screen.queryByText("Espacio académico")).not.toBeInTheDocument();
    expect(screen.queryByText("Registros")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filtros" }));

    expect(await screen.findByText("Plan de estudio")).toBeInTheDocument();
    expect(await screen.findByText("Espacio académico")).toBeInTheDocument();
    expect(await screen.findByText("Registros")).toBeInTheDocument();
  });
});
