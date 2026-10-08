import type { ComponentProps } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { createTestQueryClient, renderWithQueryClient } from "@/../test/utils/render-with-query-client";

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: jest.requireActual("@/../test/utils/mock-virtualizer").mockVirtualizer,
}));

type Item = {
  id: string;
  name: string;
};

type FetchPageResult = {
  items: Item[];
  nextPage: number | null;
};

type FetchPageMock = jest.Mock<Promise<FetchPageResult>, [AsyncDropdownFetchPageInput]>;
type RenderDropdownResult = ReturnType<typeof renderWithQueryClient> & {
  fetchPage: FetchPageMock;
  onValueChange: jest.Mock;
};

const baseItems: Item[] = [
  { id: "ar", name: "Argentina" },
  { id: "uy", name: "Uruguay" },
];

function renderDropdown(overrides: Partial<ComponentProps<typeof AsyncDropdown<Item>>> = {}): RenderDropdownResult {
  const fetchPage = jest.fn<Promise<FetchPageResult>, [AsyncDropdownFetchPageInput]>();
  const onValueChange = jest.fn();

  fetchPage.mockResolvedValue({
    items: baseItems,
    nextPage: null,
  });

  const utils = renderWithQueryClient(
    <AsyncDropdown<Item>
      fetchPage={fetchPage}
      getItemLabel={(item) => item.name}
      getItemValue={(item) => item.id}
      onValueChange={onValueChange}
      placeholder="Seleccionar"
      queryKey={["countries"]}
      {...overrides}
    />,
  );

  return { ...utils, fetchPage, onValueChange };
}

function getTrigger(): HTMLElement {
  return screen.getAllByRole("combobox")[0] as HTMLElement;
}

describe("AsyncDropdown", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("fetches only on opening and returns the chosen record before closing", async () => {
    const user = userEvent.setup();
    const { fetchPage, onValueChange } = renderDropdown();

    expect(getTrigger()).toHaveTextContent("Seleccionar");
    expect(fetchPage).not.toHaveBeenCalled();

    await user.click(getTrigger());

    expect(await screen.findByRole("option", { name: "Argentina" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Uruguay" })).toBeVisible();
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage.mock.calls[0]?.[0]).toEqual({
      page: 0,
      search: "",
      size: 50,
      signal: expect.any(AbortSignal),
    });

    await user.click(screen.getByRole("option", { name: "Argentina" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("ar", { id: "ar", name: "Argentina" });
    await waitFor(() => expect(screen.queryByRole("option")).not.toBeInTheDocument());
  });

  it("keeps the submitted ID stable while replacing fallback labels with fetched data", async () => {
    const user = userEvent.setup();
    const fetchPage = jest.fn().mockResolvedValue({ items: baseItems, nextPage: null });
    const queryClient = createTestQueryClient();
    const dropdown = (selectedLabel?: string) => (
      <form aria-label="profile">
        <AsyncDropdown<Item>
          fetchPage={fetchPage}
          getItemLabel={(item) => item.name}
          getItemValue={(item) => item.id}
          name="country"
          onValueChange={jest.fn()}
          queryKey={["country-label"]}
          selectedLabel={selectedLabel}
          value="ar"
        />
      </form>
    );
    const { rerender } = render(dropdown(), {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    });
    const form = screen.getByRole("form", { name: "profile" }) as HTMLFormElement;
    expect(getTrigger()).toHaveTextContent("ar");
    expect(new FormData(form).get("country")).toBe("ar");

    rerender(dropdown("Chosen Label"));
    expect(getTrigger()).toHaveTextContent("Chosen Label");

    await user.click(getTrigger());
    await waitFor(() => expect(getTrigger()).toHaveTextContent("Argentina"));
    expect(new FormData(form).get("country")).toBe("ar");
  });

  it("does not open or fetch when disabled", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown({ disabled: true });
    const trigger = getTrigger();

    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(fetchPage).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument();
  });

  it("clears the selected value from the trigger", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderDropdown({
      clearable: true,
      value: "ar",
      selectedLabel: "Argentina",
    });

    await user.click(screen.getByRole("button", { name: "Limpiar selección" }));

    expect(onValueChange).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.queryByPlaceholderText("Buscar...")).not.toBeInTheDocument();
  });

  it("renders the empty state with title", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown({
      emptyTitle: "No hay elementos",
    });

    fetchPage.mockResolvedValueOnce({
      items: [],
      nextPage: null,
    });

    await user.click(getTrigger());

    expect(await screen.findByText("No hay elementos")).toBeInTheDocument();
  });

  it("renders search empty state when searching yields no results", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown({
      debounceMs: 0,
      emptyTitle: "No hay elementos",
    });
    fetchPage.mockImplementation(({ search }) =>
      Promise.resolve({
        items: search ? [] : baseItems,
        nextPage: null,
      }),
    );

    await user.click(getTrigger());
    expect(await screen.findByText("Argentina")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Buscar...");
    await user.type(searchInput, "Inexistente");

    expect(await screen.findByText("No se encontraron resultados")).toBeInTheDocument();
  });

  it("renders the error state and retries", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown({
      errorMessage: "No carga",
    });

    fetchPage.mockRejectedValueOnce(new Error("boom"));

    await user.click(getTrigger());

    expect(await screen.findByText("No carga")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("No carga");

    fetchPage.mockResolvedValueOnce({
      items: baseItems,
      nextPage: null,
    });

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByRole("option", { name: "Argentina" })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("debounces search input before refetching", async () => {
    jest.useFakeTimers();

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const { fetchPage } = renderDropdown({
      debounceMs: 200,
    });

    await user.click(getTrigger());
    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText("Buscar..."), "arg");

    expect(fetchPage).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(fetchPage.mock.calls[1]?.[0]).toMatchObject({
      page: 0,
      search: "arg",
      size: 50,
    });
  });

  it("resets the search input on close by default", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown();

    await user.click(getTrigger());
    await screen.findByText("Argentina");
    await user.type(screen.getByPlaceholderText("Buscar..."), "arg");
    await user.click(getTrigger());
    await user.click(getTrigger());

    expect(await screen.findByPlaceholderText("Buscar...")).toHaveValue("");
    expect(fetchPage).toHaveBeenCalled();
  });

  it("refreshes options even when the app query client considers them fresh", async () => {
    const user = userEvent.setup();
    const fetchPage = jest.fn<Promise<FetchPageResult>, [AsyncDropdownFetchPageInput]>();
    const queryClient = createTestQueryClient({
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
      },
    });
    fetchPage.mockResolvedValueOnce({ items: baseItems, nextPage: null });

    render(
      <QueryClientProvider client={queryClient}>
        <AsyncDropdown<Item>
          fetchPage={fetchPage}
          getItemLabel={(item) => item.name}
          getItemValue={(item) => item.id}
          onValueChange={jest.fn()}
          placeholder="Seleccionar"
          queryKey={["fresh-options"]}
        />
      </QueryClientProvider>,
    );

    await user.click(getTrigger());
    await screen.findByText("Argentina");
    await user.click(getTrigger());

    fetchPage.mockResolvedValueOnce({ items: [{ id: "br", name: "Brasil" }], nextPage: null });
    await user.click(getTrigger());

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Brasil")).toBeInTheDocument();
    expect(screen.queryByText("Argentina")).not.toBeInTheDocument();
  });

  it("preserves the search input when resetSearchOnClose is false", async () => {
    const user = userEvent.setup();

    renderDropdown({
      resetSearchOnClose: false,
    });

    await user.click(getTrigger());
    await screen.findByText("Argentina");
    await user.type(screen.getByPlaceholderText("Buscar..."), "arg");
    await user.click(getTrigger());
    await user.click(getTrigger());

    expect(await screen.findByPlaceholderText("Buscar...")).toHaveValue("arg");
  });

  it("loads the next page when there is another page available", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown();

    fetchPage
      .mockResolvedValueOnce({
        items: [{ id: "ar", name: "Argentina" }],
        nextPage: 1,
      })
      .mockResolvedValueOnce({
        items: [{ id: "uy", name: "Uruguay" }],
        nextPage: null,
      });

    await user.click(getTrigger());

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(fetchPage.mock.calls[0]?.[0]).toMatchObject({ page: 0 });
    expect(fetchPage.mock.calls[1]?.[0]).toMatchObject({ page: 1 });
    expect(await screen.findByRole("option", { name: "Uruguay" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Argentina" })).toBeVisible();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("allows selecting the default option when there are no fetched results", async () => {
    const user = userEvent.setup();
    const { fetchPage, onValueChange } = renderDropdown({
      defaultOption: { label: "Todos los países", value: undefined },
      emptyMessage: "No se encontraron países.",
    });
    fetchPage.mockResolvedValueOnce({ items: [], nextPage: null });

    await user.click(getTrigger());

    expect(await screen.findByRole("option", { name: "Todos los países" })).toBeInTheDocument();
    expect(screen.queryByText("No se encontraron países.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Todos los países" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined, undefined);
    await waitFor(() => expect(screen.queryByRole("option")).not.toBeInTheDocument());
  });
});
