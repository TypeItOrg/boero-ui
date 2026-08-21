import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTableFilters } from "@common/components/ui/data-table-filters";

const mockNavigate = jest.fn();

jest.mock("@common/components/ui/data-table-navigation", () => ({
  useDataTableNavigation: () => ({ isPending: false, navigate: mockNavigate }),
}));

describe("DataTableFilters", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses a wrapped flex layout with compact year and date filters", () => {
    const { container } = render(
      <DataTableFilters
        dateFilters={[{ label: "Vigente en", name: "validOn", value: undefined }]}
        search=""
        searchPlaceholder="Buscar..."
        yearFilters={[
          {
            defaultValue: "all",
            label: "Año",
            maxYear: 2030,
            minYear: 2020,
            name: "year",
            value: "all",
          },
        ]}
      >
        <div data-testid="custom-filter" />
      </DataTableFilters>,
    );

    expect(container.querySelector("form")).toHaveClass("flex", "flex-wrap", "[&>*]:flex-[1_0_min(250px,100%)]");
    expect(screen.getByText("Buscar").closest("label")).toHaveClass("!flex-[2_1_min(300px,100%)]");
    expect(screen.getByText("Año").parentElement).toHaveClass("!flex-[1_0_min(160px,100%)]");
    expect(screen.getByText("Vigente en").closest("label")).toHaveClass("!flex-[1_0_min(200px,100%)]");
  });

  it("debounces a manually entered date before updating the query", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: undefined }]} />);

    await user.type(screen.getByRole("textbox"), "01012035");

    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(349));
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({ page: "0", startDate: "2035-01-01" }, { replace: true });
  });

  it("debounces general search and resets the page while preserving the size", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<DataTableFilters search="" searchPlaceholder="Buscar..." size={20} />);

    await user.type(screen.getByRole("textbox"), "activo");

    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(350));

    expect(mockNavigate).toHaveBeenCalledWith({ page: "0", search: "activo", size: "20" }, { replace: true });
  });

  it("keeps the date picker mounted when the external filter value changes", () => {
    const { rerender } = render(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: undefined }]} />);
    const input = screen.getByRole("textbox");

    rerender(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: "2035-01-01" }]} />);

    expect(screen.getByRole("textbox")).toBe(input);
    expect(input).toHaveValue("01/01/2035");
  });

  it("cancels a pending date update when manual editing continues", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: undefined }]} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "01012035");
    await user.type(input, "{Backspace}");
    act(() => jest.advanceTimersByTime(350));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
