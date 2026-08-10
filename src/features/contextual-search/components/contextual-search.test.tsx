import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildingIcon, HouseIcon, UserRoundIcon, UsersIcon } from "lucide-react";

import { ContextualSearch } from "@features/contextual-search/components/contextual-search";
import { fetchContextualSearch } from "@features/contextual-search/services/fetch-contextual-search.service";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchSummary } from "@features/contextual-search/types/contextual-search-summary.types";
import { renderWithQueryClient } from "@/../test/utils/render-with-query-client";

const mockRouter = { push: jest.fn() };

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("@features/contextual-search/services/fetch-contextual-search.service", () => ({
  fetchContextualSearch: jest.fn(),
}));

const mockedFetchContextualSearch = jest.mocked(fetchContextualSearch);
const institutionId = "019848b9-2e20-7a11-992a-87e71b86ce6b";
const institutionalAccessSections = [
  {
    items: [{ title: "Inicio", url: "/", icon: HouseIcon, exact: true }],
  },
  {
    label: "Plataforma",
    items: [
      { title: "Institución", url: "/institution", icon: BuildingIcon },
      { title: "Usuarios", url: "/people", icon: UsersIcon },
    ],
  },
  {
    label: "General",
    items: [{ title: "Perfil", url: "/profile", icon: UserRoundIcon }],
  },
] satisfies readonly ContextualSearchAccessSection[];

const platformAccessSections = [
  {
    items: [{ title: "Inicio", url: "/admin", icon: HouseIcon, exact: true }],
  },
  {
    label: "Menú",
    items: [
      { title: "Instituciones", url: "/admin/institutions", icon: BuildingIcon },
      { title: "Usuarios", url: "/admin/people", icon: UsersIcon },
    ],
  },
] satisfies readonly ContextualSearchAccessSection[];

const userSearchResult = {
  id: "person-1",
  institutionId: "institution-1",
  institutionName: null,
  institutionActive: null,
  title: "Matías Delgado",
  subtitle: "44741306",
  status: "ENABLED",
  category: null,
};

const userSearchSummary: ContextualSearchSummary = {
  groups: [
    {
      entityType: "user",
      items: [userSearchResult],
      hasMore: false,
    },
  ],
};

describe("ContextualSearch", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
    mockedFetchContextualSearch.mockReset();
  });

  it("shows the command shortcut on Mac", async () => {
    renderWithQueryClient(
      <ContextualSearch accessSections={platformAccessSections} scope="platform" shortcutPlatform="mac" />,
    );

    expect(await screen.findByText("\u2318 K")).toBeInTheDocument();
  });

  it("shows the control shortcut on Windows", async () => {
    renderWithQueryClient(
      <ContextualSearch accessSections={platformAccessSections} scope="platform" shortcutPlatform="windows" />,
    );

    expect(await screen.findByText("Ctrl K")).toBeInTheDocument();
  });

  it("opens the modal and focuses the contextual input", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(
      <ContextualSearch
        accessSections={institutionalAccessSections}
        scope="institutional"
        institutionId={institutionId}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Buscar en la institución" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveClass(
      "bottom-0",
      "max-w-none",
      "rounded-none!",
      "max-sm:data-open:slide-in-from-bottom",
      "sm:max-w-2xl",
      "sm:top-[15vh]",
      "sm:rounded-xl!",
      "sm:translate-y-0",
    );
    expect(screen.getByRole("combobox", { name: "Buscar en la institución" })).toHaveFocus();
    expect(screen.getByText("Esc")).toHaveAttribute("data-slot", "kbd");
    expect(screen.getByText("Esc")).toHaveClass("hidden", "sm:inline-flex");
    expect(screen.queryByText("Accesos")).not.toBeInTheDocument();
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
    expect(screen.getByText("Plataforma")).toBeInTheDocument();
    expect(screen.getByText("Institución")).toBeInTheDocument();
  });

  it("shows and filters navigation accesses before remote search", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ContextualSearch accessSections={platformAccessSections} scope="platform" />);

    await user.click(screen.getByRole("button", { name: "Buscar en la plataforma" }));
    const input = screen.getByRole("combobox", { name: "Buscar en la plataforma" });

    expect(screen.getByText("Instituciones")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();

    await user.type(input, "n");

    expect(screen.getByText("Instituciones")).toBeInTheDocument();
    expect(screen.queryByText("Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText("Usuarios")).not.toBeInTheDocument();
    expect(mockedFetchContextualSearch).not.toHaveBeenCalled();
  });

  it("does not open the modal from focus alone", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ContextualSearch accessSections={platformAccessSections} scope="platform" />);

    await user.tab();

    expect(screen.getByRole("button", { name: "Buscar en la plataforma" })).toHaveFocus();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens from the keyboard shortcut", async () => {
    renderWithQueryClient(<ContextualSearch accessSections={platformAccessSections} scope="platform" />);

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Buscar en la plataforma" })).toHaveFocus();
  });

  it("searches remotely and groups results by entity", async () => {
    const user = userEvent.setup();
    mockedFetchContextualSearch.mockResolvedValue(userSearchSummary);

    renderWithQueryClient(
      <ContextualSearch
        accessSections={institutionalAccessSections}
        scope="institutional"
        institutionId={institutionId}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar en la institución" }));
    await user.type(screen.getByRole("combobox", { name: "Buscar en la institución" }), "ma");

    expect(await screen.findByText("Usuarios")).toBeInTheDocument();
    expect(await screen.findByText("Matías Delgado")).toBeInTheDocument();
    expect(screen.getByText("44741306")).toBeInTheDocument();
    expect(screen.getByText("Habilitado")).toBeInTheDocument();
    expect(mockedFetchContextualSearch).toHaveBeenCalledWith(
      { scope: "institutional", institutionId, search: "ma" },
      expect.any(AbortSignal),
    );
  });

  it("shows a result-shaped loading skeleton", async () => {
    const user = userEvent.setup();
    mockedFetchContextualSearch.mockImplementation(() => new Promise<ContextualSearchSummary>(() => {}));

    renderWithQueryClient(
      <ContextualSearch
        accessSections={institutionalAccessSections}
        scope="institutional"
        institutionId={institutionId}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar en la institución" }));
    await user.type(screen.getByRole("combobox", { name: "Buscar en la institución" }), "ma");

    const skeleton = await screen.findByLabelText("Buscando resultados");
    expect(skeleton).toHaveClass("px-3", "sm:px-4");
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3);
  });

  it("navigates after selecting a result and clears the next search", async () => {
    const user = userEvent.setup();
    mockedFetchContextualSearch.mockResolvedValue(userSearchSummary);

    renderWithQueryClient(
      <ContextualSearch
        accessSections={institutionalAccessSections}
        scope="institutional"
        institutionId={institutionId}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Buscar en la institución" }));
    const input = screen.getByRole("combobox", { name: "Buscar en la institución" });
    await user.type(input, "ma");
    await user.click(await screen.findByText("Matías Delgado"));

    expect(mockRouter.push).toHaveBeenCalledWith("/people/person-1");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Buscar en la institución" }));
    expect(screen.getByRole("combobox", { name: "Buscar en la institución" })).toHaveValue("");
  });

  it("closes with Escape and clears the pending query", async () => {
    const user = userEvent.setup();

    renderWithQueryClient(<ContextualSearch accessSections={platformAccessSections} scope="platform" />);

    const trigger = screen.getByRole("button", { name: "Buscar en la plataforma" });
    await user.click(trigger);
    const input = screen.getByRole("combobox", { name: "Buscar en la plataforma" });
    await user.type(input, "ma");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).not.toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Buscar en la plataforma" }));
    expect(screen.getByRole("combobox", { name: "Buscar en la plataforma" })).toHaveValue("");
  });
});
