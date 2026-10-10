import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { Sheet, SheetTrigger } from "@common/components/ui/sheet";

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

    expect(screen.queryByRole("button", { name: "Filtros" })).not.toBeInTheDocument();

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

  it("replaces an edited search with the URL value and cancels its queued navigation", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { rerender } = render(<DataTableFilters search="piano" searchPlaceholder="Buscar..." />);
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "búsqueda pendiente");
    rerender(<DataTableFilters search="violín" searchPlaceholder="Buscar..." />);

    expect(screen.getByRole("textbox")).toBe(input);
    expect(input).toHaveValue("violín");
    act(() => jest.advanceTimersByTime(350));
    expect(mockNavigate).not.toHaveBeenCalled();
    rerender(<DataTableFilters search="piano" searchPlaceholder="Buscar..." />);
    expect(input).toHaveValue("piano");
  });

  it("replaces an edited date with the URL value without resurrecting an old draft on back navigation", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { rerender } = render(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: "2035-01-01" }]} />);
    const input = screen.getByRole("textbox");

    await user.clear(input);
    await user.type(input, "02022036");
    rerender(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: "2036-03-03" }]} />);

    expect(screen.getByRole("textbox")).toBe(input);
    expect(input).toHaveValue("03/03/2036");
    act(() => jest.advanceTimersByTime(350));
    expect(mockNavigate).not.toHaveBeenCalled();
    rerender(<DataTableFilters dateFilters={[{ label: "Inicio", name: "startDate", value: "2035-01-01" }]} />);
    expect(input).toHaveValue("01/01/2035");
  });

  it("opens secondary filters and closes them when viewing results", async () => {
    const user = userEvent.setup();
    render(
      <DataTableFilters
        activeAdvancedCount={0}
        advancedFilters={<div data-testid="advanced-custom" />}
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
        search=""
        searchPlaceholder="Buscar..."
        selectFilters={[
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
        size={20}
      />,
    );

    expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
    expect(screen.queryByTestId("advanced-custom")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filtros" }));

    expect(await screen.findByTestId("advanced-custom")).toBeInTheDocument();
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ver resultados/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the active advanced count on the trigger and hides the badge when zero", () => {
    const advancedSelectFilters = [
      {
        defaultValue: "false",
        label: "Registros",
        name: "deleted",
        options: [
          { value: "false", label: "Vigentes" },
          { value: "true", label: "Eliminados" },
        ],
        value: "true",
      },
    ] as const;

    const { rerender } = render(
      <DataTableFilters
        activeAdvancedCount={2}
        advancedFilters={<div />}
        advancedSelectFilters={[...advancedSelectFilters]}
        search=""
        searchPlaceholder="Buscar..."
        size={20}
      />,
    );

    expect(screen.getByTestId("advanced-filters-badge")).toHaveTextContent("3");

    rerender(
      <DataTableFilters
        activeAdvancedCount={0}
        advancedFilters={<div />}
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
        search=""
        searchPlaceholder="Buscar..."
        size={20}
      />,
    );

    expect(screen.queryByTestId("advanced-filters-badge")).not.toBeInTheDocument();
  });

  it("clears advanced filters in one navigation while preserving size", async () => {
    const user = userEvent.setup();
    render(
      <DataTableFilters
        activeAdvancedCount={1}
        advancedFilters={<div />}
        advancedResetKeys={["academicSpaceId", "studyPlanId"]}
        advancedSelectFilters={[
          {
            defaultValue: "false",
            label: "Registros",
            name: "deleted",
            options: [
              { value: "false", label: "Vigentes" },
              { value: "true", label: "Eliminados" },
            ],
            value: "true",
          },
        ]}
        search="piano"
        searchPlaceholder="Buscar..."
        size={20}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Filtros" }));
    const clearButton = await screen.findByRole("button", { name: /limpiar filtros/i });
    expect(clearButton).not.toBeDisabled();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();

    await user.click(clearButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      {
        academicSpaceId: undefined,
        deleted: undefined,
        page: "0",
        size: "20",
        studyPlanId: undefined,
      },
      { replace: true },
    );
  });

  it("disables clearing filters when the active advanced badge count is zero", async () => {
    const user = userEvent.setup();
    render(
      <DataTableFilters
        advancedFilters={<div />}
        advancedResetKeys={["academicSpaceId", "studyPlanId"]}
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
        search="piano"
        searchPlaceholder="Buscar..."
        size={20}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Filtros" }));
    const clearButton = await screen.findByRole("button", { name: /limpiar filtros/i });
    expect(clearButton).toBeDisabled();

    await user.click(clearButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("supports an external trigger that opens the advanced dialog from outside the form", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button type="button">Abrir externos</button>
        </SheetTrigger>
        <DataTableFilters
          advancedFilters={<div data-testid="advanced-custom" />}
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
          search=""
          searchPlaceholder="Buscar..."
          size={20}
          triggerPosition="external"
        />
      </Sheet>,
    );

    expect(screen.queryByText("Filtros")).not.toBeInTheDocument();
    expect(screen.queryByTestId("advanced-custom")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Abrir externos" }));

    expect(await screen.findByTestId("advanced-custom")).toBeInTheDocument();
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
