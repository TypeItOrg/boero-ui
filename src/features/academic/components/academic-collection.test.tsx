import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { fetchAcademicSpaces, fetchCourses, fetchShifts, fetchStudyPlans, fetchTrainingPath } from "@features/academic/services/academic.service";
import type { AcademicCollectionProps } from "@features/academic/types/academic-collection-view-props.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

import { renderWithQueryClient } from "@/../test/utils/render-with-query-client";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockQuery = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/courses",
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockQuery,
}));
jest.mock("@features/institutional-auth/services/get-institutional-user.service", () => ({
  requireInstitutionalUser: jest.fn(async () => ({ permissionScopes: {} })),
}));
jest.mock("@features/academic/services/academic.service", () => ({
  fetchAcademicSpaces: jest.fn(),
  fetchAcademicYears: jest.fn(),
  fetchCourses: jest.fn(),
  fetchInstruments: jest.fn(),
  fetchShifts: jest.fn(),
  fetchStudyPlans: jest.fn(),
  fetchTrainingPath: jest.fn(),
  fetchTrainingPaths: jest.fn(),
}));

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const PLAN_ID = "6f8e2c9a-3b4d-4e5f-a6b7-c8d9e0f1a2b3";
const SPACE_ID = "7a9b3d5e-4c6f-4a8b-b9c0-d1e2f3a4b5c6";
const PATH_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";
const OTHER_PATH_ID = "a755b72b-04b7-4255-8bca-243f391155cc";
const PLAN = {
  id: PLAN_ID,
  institutionId: INSTITUTION_ID,
  institutionName: "Conservatorio",
  trainingPathId: PATH_ID,
  trainingPathName: "CAV Básico",
  name: "Plan 2026",
  effectiveFrom: "2026-03-03",
  effectiveTo: null,
  status: "DRAFT" as const,
};

describe("AcademicCollectionView with its real table and filters", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockQuery = new URLSearchParams();
    jest
      .mocked(fetchStudyPlans)
      .mockReset()
      .mockResolvedValue({
        items: [PLAN],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
      });
    jest.mocked(fetchCourses).mockReset().mockResolvedValue({
      items: [],
      page: 0,
      size: 30,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it("keeps the contextual path fixed in the query and removes its redundant filter and column", async () => {
    await renderCollection({
      columns: { primaryLabel: "Nombre", detailLabels: ["Vigente desde", "Vigente hasta"], sortableFields: ["name", "effectiveFrom", "effectiveTo"] },
      fixedTrainingPathId: PATH_ID,
      searchParams: { size: "20", trainingPathId: OTHER_PATH_ID },
    });

    expect(fetchStudyPlans).toHaveBeenCalledWith(
      "institutional",
      INSTITUTION_ID,
      expect.objectContaining({
        size: 20,
        trainingPathId: PATH_ID,
      }),
    );
    expect(fetchTrainingPath).not.toHaveBeenCalled();
    const table = screen.getByRole("table");
    const row = within(table).getByRole("row", { name: /Plan 2026/ });
    expect(within(row).getByText("03/03/2026")).toBeInTheDocument();
    expect(within(row).getByText("Sin definir")).toBeInTheDocument();
    expect(within(row).queryByText("CAV Básico")).not.toBeInTheDocument();
    expect(screen.queryByText("Trayecto formativo")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan 2026" })).toHaveAttribute("href", "/study-plans/" + PLAN_ID);
    expect(screen.getByRole("button", { name: /Filtros avanzados/ })).toBeInTheDocument();
  });

  it("renders the filtered institution and sends global row links to that institution's administration", async () => {
    const user = userEvent.setup();
    await renderCollection({
      basePath: "/admin",
      global: true,
      institutionId: undefined,
      institutionName: "Conservatorio",
      scope: AcademicScope.ADMIN,
      searchParams: { institutionId: INSTITUTION_ID, size: "20" },
    });

    expect(fetchStudyPlans).toHaveBeenCalledWith("admin", undefined, expect.objectContaining({ institutionId: INSTITUTION_ID }));
    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Institución" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "Conservatorio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Plan 2026" })).toHaveAttribute(
      "href",
      "/admin/institutions/" + INSTITUTION_ID + "/academic/study-plans/" + PLAN_ID,
    );
    await user.click(screen.getByRole("button", { name: /Filtros avanzados/ }));
    expect(within(screen.getByRole("dialog")).getByText("Conservatorio")).toBeInTheDocument();
  });

  it("does not offer creation in the actual empty view of deleted records", async () => {
    jest.mocked(fetchStudyPlans).mockResolvedValue({ items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 });
    await renderCollection({ searchParams: { deleted: "true", size: "20" } });

    expect(fetchStudyPlans).toHaveBeenCalledWith("institutional", INSTITUTION_ID, expect.objectContaining({ deleted: true }));
    expect(screen.queryByRole("link", { name: "Nuevo plan de estudio" })).not.toBeInTheDocument();
    expect(screen.getByText("Sin planes de estudio eliminados para mostrar")).toBeInTheDocument();
  });

  it("opens course filters from the header and clears only advanced filters in one navigation", async () => {
    const user = userEvent.setup();
    mockQuery = new URLSearchParams({
      academicSpaceId: SPACE_ID,
      institutionId: INSTITUTION_ID,
      studyPlanId: PLAN_ID,
      page: "2",
      size: "30",
      courseStatus: "ACTIVE",
      year: "2026",
      search: "piano",
    });
    await renderCollection({
      basePath: "/admin",
      global: true,
      scope: AcademicScope.ADMIN,
      resource: AcademicResource.COURSE,
      institutionId: undefined,
      searchParams: Object.fromEntries(mockQuery),
      createAction: <a href="/admin/courses/new">Nuevo curso</a>,
    });

    expect(fetchCourses).toHaveBeenCalledWith(
      "admin",
      undefined,
      expect.objectContaining({
        academicSpaceId: SPACE_ID,
        institutionId: INSTITUTION_ID,
        studyPlanId: PLAN_ID,
        page: 2,
        size: 30,
        status: "ACTIVE",
      }),
    );
    expect(screen.getAllByRole("link", { name: "Nuevo curso" }).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("Buscar por registro o institución...")).toHaveValue("piano");
    expect(screen.getByText("Ciclo lectivo")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.queryByText("Plan de estudio")).not.toBeInTheDocument();
    expect(screen.queryByText("Espacio académico")).not.toBeInTheDocument();
    expect(screen.queryByText("Registros")).not.toBeInTheDocument();
    expect(screen.getByTestId("advanced-filters-badge")).toHaveTextContent("3");

    await user.click(screen.getByRole("button", { name: /Filtros avanzados/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Plan de estudio")).toBeInTheDocument();
    expect(within(dialog).getByText("Espacio académico")).toBeInTheDocument();
    expect(within(dialog).getByText("Institución")).toBeInTheDocument();
    expect(within(dialog).getByText("Registros")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Limpiar filtros" }));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const destination = new URL(mockReplace.mock.calls[0][0], "https://boero.test");
    expect(destination.pathname).toBe("/admin/courses");
    expect(Object.fromEntries(destination.searchParams)).toEqual({
      page: "0",
      size: "30",
      courseStatus: "ACTIVE",
      year: "2026",
      search: "piano",
    });
    expect(mockPush).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "Ver resultados" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each(["space", "shift"] as const)("renders %s data through the real table instead of checking its mapper alone", async (kind) => {
    if (kind === "space") {
      jest.mocked(fetchAcademicSpaces).mockResolvedValue({
        items: [
          { id: SPACE_ID, institutionId: INSTITUTION_ID, name: "Armonía", description: null, type: "SUBJECT", format: "INDIVIDUAL", active: true },
        ],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
      });
    } else {
      jest.mocked(fetchShifts).mockResolvedValue({
        items: [{ id: SPACE_ID, institutionId: INSTITUTION_ID, name: "Turno mañana", description: null, active: false }],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1,
      });
    }

    await renderCollection({ resource: kind === "space" ? AcademicResource.ACADEMIC_SPACE : AcademicResource.SHIFT });
    const row = screen.getByRole("row", { name: kind === "space" ? /Armonía/ : /Turno mañana/ });
    expect(within(row).getByText("Sin descripción")).toBeInTheDocument();
    expect(within(row).getByText(kind === "space" ? "Activo" : "Inactivo")).toBeInTheDocument();

    if (kind === "space") {
      expect(within(row).getByText("Asignatura")).toBeInTheDocument();
      expect(within(row).getByText("Individual")).toBeInTheDocument();
    }
  });
});

async function renderCollection(overrides: Partial<AcademicCollectionProps> = {}) {
  const view = await AcademicCollectionView({
    basePath: "",
    canCreate: true,
    canDelete: true,
    canChangeStatus: true,
    canUpdate: true,
    canRestore: true,
    institutionId: INSTITUTION_ID,
    resource: AcademicResource.STUDY_PLAN,
    scope: AcademicScope.INSTITUTIONAL,
    searchParams: { size: "20" },
    ...overrides,
  });

  return renderWithQueryClient(view);
}
