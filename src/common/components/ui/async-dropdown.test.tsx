import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { renderWithQueryClient } from "@/../test/utils/render-with-query-client";

jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: `virtual-${index}`,
        size: estimateSize(),
        start: index * estimateSize(),
      })),
    getTotalSize: () => count * estimateSize(),
    scrollToOffset: jest.fn(),
    measure: jest.fn(),
  }),
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

function renderDropdown(
  overrides: Partial<React.ComponentProps<typeof AsyncDropdown<Item>>> = {},
): RenderDropdownResult {
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

  it("renders the placeholder and does not fetch while closed", () => {
    const { fetchPage } = renderDropdown();

    expect(getTrigger()).toHaveTextContent("Seleccionar");
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it("renders the hidden input when name and value are provided", () => {
    renderDropdown({
      name: "country",
      value: "ar",
      selectedLabel: "Argentina",
    });

    expect(screen.getByDisplayValue("ar")).toHaveAttribute("type", "hidden");
    expect(getTrigger()).toHaveTextContent("Argentina");
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

  it("fetches the first page when opened and renders the options", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown();

    await user.click(getTrigger());

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(1));

    const firstCall = fetchPage.mock.calls[0]?.[0];

    expect(firstCall).toMatchObject({
      page: 0,
      search: "",
      size: 50,
    });
    expect(firstCall?.signal).toBeInstanceOf(AbortSignal);
    expect(await screen.findByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("Uruguay")).toBeInTheDocument();
  });

  it("calls onValueChange and closes after selecting an item", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderDropdown();

    await user.click(getTrigger());
    await user.click(await screen.findByText("Argentina"));

    expect(onValueChange).toHaveBeenCalledWith("ar", { id: "ar", name: "Argentina" });
    await waitFor(() => expect(screen.queryByText("Uruguay")).not.toBeInTheDocument());
    expect(getTrigger()).toHaveTextContent("Seleccionar");
  });

  it("prefers the loaded item label over selectedLabel and raw value", async () => {
    const user = userEvent.setup();

    renderDropdown({
      value: "ar",
      selectedLabel: "Chosen Label",
    });

    expect(getTrigger()).toHaveTextContent("Chosen Label");

    await user.click(getTrigger());

    expect(await screen.findAllByText("Argentina")).not.toHaveLength(0);
    await waitFor(() => expect(getTrigger()).toHaveTextContent("Argentina"));
  });

  it("falls back to the raw value when there is no selected item or label", () => {
    renderDropdown({
      value: "ar",
    });

    expect(getTrigger()).toHaveTextContent("ar");
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
    jest.useFakeTimers();

    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    const { fetchPage } = renderDropdown({
      emptyTitle: "No hay elementos",
    });

    fetchPage.mockResolvedValueOnce({
      items: baseItems,
      nextPage: null,
    });

    await user.click(getTrigger());
    expect(await screen.findByText("Argentina")).toBeInTheDocument();

    fetchPage.mockResolvedValueOnce({
      items: [],
      nextPage: null,
    });

    const searchInput = screen.getByPlaceholderText("Buscar...");
    await user.type(searchInput, "Inexistente");

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(await screen.findByText("No se encontraron resultados")).toBeInTheDocument();

    jest.useRealTimers();
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

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
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

  it("refreshes options when the selector is reopened", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown();
    const refreshedItems = [{ id: "br", name: "Brasil" }];

    await user.click(getTrigger());
    await screen.findByText("Argentina");
    await user.click(getTrigger());

    fetchPage.mockResolvedValueOnce({ items: refreshedItems, nextPage: null });

    await user.click(getTrigger());

    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Brasil")).toBeInTheDocument();
    expect(screen.queryByText("Argentina")).not.toBeInTheDocument();
  });

  it("refreshes options even when the app query client considers them fresh", async () => {
    const user = userEvent.setup();
    const fetchPage = jest.fn<Promise<FetchPageResult>, [AsyncDropdownFetchPageInput]>();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          refetchOnWindowFocus: false,
          retry: false,
          staleTime: 5 * 60 * 1000,
        },
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
  });

  it("renders and selects the default option when provided", async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderDropdown({
      defaultOption: { label: "Todos los países", value: undefined },
      value: undefined,
    });

    const trigger = getTrigger();
    expect(trigger).toHaveTextContent("Todos los países");

    await user.click(trigger);

    const defaultOptionItem = screen.getByRole("option", { name: "Todos los países" });
    await user.click(defaultOptionItem);

    expect(onValueChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("does not show an empty result message when only the default option is available", async () => {
    const user = userEvent.setup();
    const { fetchPage } = renderDropdown({
      defaultOption: { label: "Todos los países", value: undefined },
      emptyMessage: "No se encontraron países.",
    });
    fetchPage.mockResolvedValueOnce({ items: [], nextPage: null });

    await user.click(getTrigger());

    expect(await screen.findByRole("option", { name: "Todos los países" })).toBeInTheDocument();
    expect(screen.queryByText("No se encontraron países.")).not.toBeInTheDocument();
  });
});
