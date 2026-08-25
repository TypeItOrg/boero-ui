import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  usePathname: () => "/academic-spaces/4c9ec931-453c-4778-86a9-dc40a06d0247",
  useSearchParams: () => new URLSearchParams(),
}));

import { AcademicRouteView } from "@features/academic/components/academic-route-view";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import {
  fetchAcademicSpace,
  fetchAcademicSpaceUsage,
  fetchInstrument,
  fetchStudyPlan,
  fetchStudyPlanCurriculum,
  fetchTrainingPath,
  fetchTrainingPaths,
} from "@features/academic/services/academic.service";
import { FULL_ACADEMIC_ACCESS } from "@features/academic/types/academic-access.types";
import type { AcademicSpaceUsage } from "@features/academic/types/academic-space-usage.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

jest.mock("@features/academic/services/academic.service", () => ({
  fetchAcademicSpace: jest.fn(),
  fetchAcademicSpaceUsage: jest.fn(),
  fetchInstrument: jest.fn(),
  fetchStudyPlan: jest.fn(),
  fetchStudyPlanCurriculum: jest.fn(),
  fetchTrainingPath: jest.fn(),
  fetchTrainingPaths: jest.fn(),
}));
jest.mock("@features/academic/components/training-path-study-plans", () => ({
  TrainingPathStudyPlans: jest.fn(() => <div data-testid="training-path-study-plans" />),
}));

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const STUDY_PLAN_ID = "019f9c3d-9663-77da-a21b-5c811c040616";
const TRAINING_PATH_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";
const INSTRUMENT_ID = "3b9ec931-453c-4778-86a9-dc40a06d0247";
const ACADEMIC_SPACE_ID = "4c9ec931-453c-4778-86a9-dc40a06d0247";
const LEVEL_ID = "a755b72b-04b7-4255-8bca-243f391155cc";

const STUDY_PLAN = {
  id: STUDY_PLAN_ID,
  institutionId: INSTITUTION_ID,
  trainingPathId: TRAINING_PATH_ID,
  trainingPathName: "Profesorado de Música",
  name: "Plan 2026",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  status: "DRAFT" as const,
};

const TRAINING_PATH = {
  id: TRAINING_PATH_ID,
  institutionId: INSTITUTION_ID,
  name: "Profesorado de Música",
  description: "Formación docente musical.",
  active: true,
};

const INSTRUMENT = {
  id: INSTRUMENT_ID,
  institutionId: INSTITUTION_ID,
  name: "Piano",
  description: "Instrumento de teclas.",
  active: true,
};

const ACADEMIC_SPACE = {
  id: ACADEMIC_SPACE_ID,
  institutionId: INSTITUTION_ID,
  name: "Armonía",
  description: "Lenguaje musical aplicado.",
  type: "SUBJECT" as const,
  format: "INDIVIDUAL" as const,
  active: true,
};

const ACADEMIC_SPACE_USAGE: AcademicSpaceUsage = {
  summary: {
    totalPlans: 1,
    activePlans: 1,
    draftPlans: 0,
    inactivePlans: 0,
    totalPlacements: 1,
    unassignedPlacements: 0,
    deactivationBlocked: true,
  },
  plans: {
    items: [],
    page: 0,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  },
  warnings: [{ code: "USED_IN_ACTIVE_OR_DRAFT_PLAN", blockingPlanCount: 1 }],
};

describe("AcademicRouteView", () => {
  beforeEach(() => {
    jest.mocked(fetchStudyPlan).mockResolvedValue(STUDY_PLAN);
    jest.mocked(fetchAcademicSpace).mockResolvedValue(ACADEMIC_SPACE);
    jest.mocked(fetchAcademicSpaceUsage).mockResolvedValue(ACADEMIC_SPACE_USAGE);
    jest.mocked(fetchStudyPlanCurriculum).mockResolvedValue({
      studyPlan: STUDY_PLAN,
      levels: [],
      unassignedSpaces: [],
      prerequisites: [],
    });
    jest.mocked(fetchTrainingPaths).mockResolvedValue({
      items: [
        {
          id: TRAINING_PATH_ID,
          institutionId: INSTITUTION_ID,
          name: "Profesorado de Música",
          description: null,
          active: true,
        },
      ],
      page: 0,
      size: 50,
      totalItems: 1,
      totalPages: 1,
    });
    jest.mocked(fetchTrainingPath).mockResolvedValue(TRAINING_PATH);
    jest.mocked(fetchInstrument).mockResolvedValue(INSTRUMENT);
  });

  it("renders a training-path detail with its related study plans", async () => {
    const result = await AcademicRouteView({
      access: FULL_ACADEMIC_ACCESS,
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.TRAINING_PATH, TRAINING_PATH_ID],
      searchParams: {},
    });

    expect(result).toHaveProperty("props.title", "Profesorado de Música");
    expect(result).toHaveProperty("props.children");
    expect(fetchTrainingPath).toHaveBeenCalledWith(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, TRAINING_PATH_ID);
  });

  it("locks the contextual study-plan form to its training path", async () => {
    const result = await AcademicRouteView({
      access: FULL_ACADEMIC_ACCESS,
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.STUDY_PLAN, ACADEMIC_ROUTE_SEGMENT.NEW],
      searchParams: {
        returnTo: `/training-paths/${TRAINING_PATH_ID}`,
        trainingPathId: TRAINING_PATH_ID,
      },
    });

    const formProps = (result.props as { children: ReactElement<Record<string, unknown>> }).children.props;

    expect(formProps).toEqual(
      expect.objectContaining({
        initialValues: {
          trainingPathId: TRAINING_PATH_ID,
          trainingPathName: "Profesorado de Música",
        },
        parentId: TRAINING_PATH_ID,
        returnTo: `/training-paths/${TRAINING_PATH_ID}`,
        trainingPathLocked: true,
      }),
    );
  });

  it("rejects malformed contextual training paths", async () => {
    await expect(
      AcademicRouteView({
        access: FULL_ACADEMIC_ACCESS,
        institutionId: INSTITUTION_ID,
        renderBreadcrumb: () => null,
        scope: AcademicScope.INSTITUTIONAL,
        segments: [AcademicResource.STUDY_PLAN, ACADEMIC_ROUTE_SEGMENT.NEW],
        searchParams: { trainingPathId: "invalid" },
      }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("returns not found when the requested training path is unavailable", async () => {
    jest.mocked(fetchTrainingPath).mockResolvedValueOnce(null);

    await expect(
      AcademicRouteView({
        access: FULL_ACADEMIC_ACCESS,
        institutionId: INSTITUTION_ID,
        renderBreadcrumb: () => null,
        scope: AcademicScope.INSTITUTIONAL,
        segments: [AcademicResource.TRAINING_PATH, TRAINING_PATH_ID],
        searchParams: {},
      }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("shows only the study plan name in the detail header", async () => {
    const result = await AcademicRouteView({
      access: FULL_ACADEMIC_ACCESS,
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.STUDY_PLAN, STUDY_PLAN_ID],
      searchParams: {},
    });

    expect(result).toHaveProperty("props.title", "Plan 2026");

    render(result);

    expect(screen.getByText("Profesorado de Música")).toBeInTheDocument();
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resumen" })).toBeInTheDocument();
    expect(screen.getByText("Vigencia")).toBeInTheDocument();
  });

  it("renders academic space usage when study plans are readable", async () => {
    const result = await AcademicRouteView({
      access: FULL_ACADEMIC_ACCESS,
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.ACADEMIC_SPACE, ACADEMIC_SPACE_ID],
      searchParams: {},
    });

    render(result);

    expect(screen.getByRole("heading", { name: "Uso en planes de estudio" })).toBeInTheDocument();
    expect(screen.getByText("No se puede desactivar este espacio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desactivar" })).toBeDisabled();
    expect(fetchAcademicSpaceUsage).toHaveBeenCalledWith(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, ACADEMIC_SPACE_ID, { page: 0, size: 10 });
  });

  it("shows the instrument status action without the edit permission", async () => {
    const result = await AcademicRouteView({
      access: { ...FULL_ACADEMIC_ACCESS, instrumentUpdate: false, instrumentStatusUpdate: true },
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.INSTRUMENT, INSTRUMENT_ID],
      searchParams: {},
    });

    render(result);

    expect(screen.getByRole("button", { name: "Desactivar" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
  });

  it("shows the training-path status action without the edit permission", async () => {
    const result = await AcademicRouteView({
      access: { ...FULL_ACADEMIC_ACCESS, trainingPathUpdate: false, trainingPathStatusUpdate: true },
      institutionId: INSTITUTION_ID,
      renderBreadcrumb: () => null,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.TRAINING_PATH, TRAINING_PATH_ID],
      searchParams: {},
    });

    render(result);

    expect(screen.getByRole("button", { name: "Desactivar" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Editar" })).not.toBeInTheDocument();
  });

  it.each([[ACADEMIC_ROUTE_SEGMENT.EDIT, "Editar plan de estudio"]])(
    "routes the study plan %s action through the primary detail",
    async (action, expectedTitle) => {
      const result = await AcademicRouteView({
        access: FULL_ACADEMIC_ACCESS,
        institutionId: INSTITUTION_ID,
        renderBreadcrumb: () => null,
        scope: AcademicScope.INSTITUTIONAL,
        segments: [AcademicResource.STUDY_PLAN, STUDY_PLAN_ID, action],
        searchParams: {},
      });

      expect(result).toHaveProperty("props.title", expectedTitle);
      expect(result).not.toHaveProperty("props.backHref");
      expect(result).toHaveProperty("props.actions");
    },
  );

  it("does not expose a dedicated study plan status page", async () => {
    await expect(
      AcademicRouteView({
        access: FULL_ACADEMIC_ACCESS,
        institutionId: INSTITUTION_ID,
        renderBreadcrumb: () => null,
        scope: AcademicScope.INSTITUTIONAL,
        segments: [AcademicResource.STUDY_PLAN, STUDY_PLAN_ID, "status"],
        searchParams: {},
      }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("renders level editing without a back action and with a contextual breadcrumb", async () => {
    jest.mocked(fetchStudyPlanCurriculum).mockResolvedValue({
      studyPlan: STUDY_PLAN,
      levels: [
        {
          level: {
            id: LEVEL_ID,
            studyPlanId: STUDY_PLAN_ID,
            name: "Nivel 1",
            displayOrder: 1,
            description: null,
          },
          spaces: [],
        },
      ],
      unassignedSpaces: [],
      prerequisites: [],
    });
    const renderBreadcrumb = jest.fn(() => null);

    const result = await AcademicRouteView({
      access: FULL_ACADEMIC_ACCESS,
      institutionId: INSTITUTION_ID,
      renderBreadcrumb,
      scope: AcademicScope.INSTITUTIONAL,
      segments: [AcademicResource.STUDY_PLAN, STUDY_PLAN_ID, AcademicResource.ACADEMIC_LEVEL, LEVEL_ID, ACADEMIC_ROUTE_SEGMENT.EDIT],
      searchParams: {},
    });

    render(result);

    expect(screen.getByRole("heading", { name: "Editar nivel" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Volver" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
    expect(renderBreadcrumb).toHaveBeenLastCalledWith({
      hiddenSegments: [AcademicResource.ACADEMIC_LEVEL, LEVEL_ID],
      segmentLabels: {
        [STUDY_PLAN_ID]: "Plan 2026",
        [ACADEMIC_ROUTE_SEGMENT.EDIT]: "Editar Nivel 1",
      },
    });
  });
});
