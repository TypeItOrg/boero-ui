import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@common/components/ui/async-dropdown", () => ({
  AsyncDropdown: jest.fn(() => null),
}));

import { PlatformRolesTableFilters } from "@features/roles/components/platform-roles-table-filters";

const mockNavigate = jest.fn();

jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ isPending: false, navigate: mockNavigate }),
}));

describe("PlatformRolesTableFilters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("keeps search and type visible and moves the institution filter into the advanced dialog", async () => {
    const user = userEvent.setup();
    render(<PlatformRolesTableFilters institutionId={undefined} institutionName={undefined} roleType={undefined} search="" size={10} />);

    expect(screen.getByPlaceholderText("Buscar por rol o institución...")).toBeInTheDocument();
    expect(screen.getByText("Tipo")).toBeInTheDocument();
    expect(screen.queryByText("Institución")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filtros" }));

    expect(await screen.findByText("Institución")).toBeInTheDocument();
  });

  it("counts an applied institution as an active advanced filter", () => {
    render(
      <PlatformRolesTableFilters
        institutionId="05b84ac4-66aa-409f-a813-012d15b8cb9b"
        institutionName="Conservatorio"
        roleType={undefined}
        search=""
        size={10}
      />,
    );

    expect(screen.getByTestId("advanced-filters-badge")).toHaveTextContent("1");
  });
});
