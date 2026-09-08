import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@common/components/ui/async-dropdown", () => ({
  AsyncDropdown: jest.fn(() => null),
}));

import { PlatformPeopleTableFilters } from "@features/people/components/platform-people-table-filters";

const mockNavigate = jest.fn();

jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ isPending: false, navigate: mockNavigate }),
}));

describe("PlatformPeopleTableFilters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("keeps search and role visible and moves the institution filter into the advanced dialog", async () => {
    const user = userEvent.setup();
    render(<PlatformPeopleTableFilters institutionId={undefined} institutionName={undefined} roleCode={undefined} roles={[]} search="" size={10} />);

    expect(screen.getByPlaceholderText("Buscar por nombre, apellido, documento o email...")).toBeInTheDocument();
    expect(screen.getByText("Rol")).toBeInTheDocument();
    expect(screen.queryByText("Institución")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filtros" }));

    expect(await screen.findByText("Institución")).toBeInTheDocument();
  });

  it("counts an applied institution as an active advanced filter and clears it", async () => {
    const user = userEvent.setup();
    render(
      <PlatformPeopleTableFilters
        institutionId="05b84ac4-66aa-409f-a813-012d15b8cb9b"
        institutionName="Conservatorio"
        roleCode={undefined}
        roles={[]}
        search=""
        size={10}
      />,
    );

    expect(screen.getByTestId("advanced-filters-badge")).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "Filtros" }));
    await user.click(await screen.findByRole("button", { name: /limpiar filtros/i }));

    expect(mockNavigate).toHaveBeenCalledWith({ institutionId: undefined, page: "0", size: "10" }, { replace: true });
  });
});
