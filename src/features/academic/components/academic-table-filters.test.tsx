import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";

import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

import { createTestQueryClient } from "@/../test/utils/render-with-query-client";

jest.mock("next/navigation", () => ({
  usePathname: () => "/study-plans",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: jest.requireActual("@/../test/utils/mock-virtualizer").mockVirtualizer,
}));

describe("AcademicTableFilters with a shared options cache", () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

  beforeEach(() => {
    global.fetch = fetchMock;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    fetchMock.mockReset();
  });

  it("never displays cached options from another institution or authentication scope", async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient({ queries: { staleTime: 5 * 60 * 1000 } });
    const contexts = [
      { institutionId: "institution-a", scope: AcademicScope.INSTITUTIONAL, name: "Piano A" },
      { institutionId: "institution-b", scope: AcademicScope.INSTITUTIONAL, name: "Canto B" },
      { institutionId: "institution-b", scope: AcademicScope.ADMIN, name: "Administración B" },
    ];
    let finishRequest: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finishRequest = resolve;
        }),
    );
    const filters = (context: (typeof contexts)[number]) => (
      <AcademicTableFilters
        dateFilters={[]}
        filters={[]}
        search=""
        searchable={false}
        size={10}
        trainingPathFilter={{ ...context, selectedLabel: undefined, value: undefined }}
        yearFilters={[]}
      />
    );
    const { rerender } = render(filters(contexts[0]), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <DataTableNavigationProvider>{children}</DataTableNavigationProvider>
        </QueryClientProvider>
      ),
    });

    await user.click(screen.getByRole("combobox"));

    for (const [index, context] of contexts.entries()) {
      if (index > 0) {
        rerender(filters(context));
      }

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(index + 1));

      for (const previous of contexts.slice(0, index)) {
        expect(screen.queryByRole("option", { name: previous.name })).not.toBeInTheDocument();
      }

      const requestUrl = new URL(String(fetchMock.mock.calls[index][0]), "https://boero.test");
      expect(requestUrl.pathname).toBe("/api/" + context.scope + "/academic/options/training-paths");
      expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
        institutionId: context.institutionId,
        page: "0",
        search: "",
        size: "20",
        active: "all",
      });

      if (!finishRequest) {
        throw new Error("Options request was not started");
      }

      finishRequest(
        Response.json({
          items: [{ id: "path-" + index, name: context.name, active: true }],
          page: 0,
          totalPages: 1,
        }),
      );
      expect(await screen.findByRole("option", { name: context.name })).toBeVisible();
    }
  });
});
