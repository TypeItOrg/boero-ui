import { render, screen } from "@testing-library/react";

import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";

const mockNavigate = jest.fn();

jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ isPending: false, navigate: mockNavigate }),
}));

describe("AcademicTableFilters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("uses the resource-specific placeholder for the general search", () => {
    render(
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
  });
});
