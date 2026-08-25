jest.mock("@common/components/ui/data-table-navigation", () => ({
  DataTableNavigationProvider: ({ children }: React.PropsWithChildren): React.ReactElement => <>{children}</>,
}));
jest.mock("@features/academic/components/academic-table-filters", () => ({
  AcademicTableFilters: jest.fn(() => <div data-testid="academic-table-filters" />),
}));
jest.mock("@features/academic/components/academic-table-presentation", () => ({
  AcademicTablePresentation: jest.fn(() => <div data-testid="academic-table-presentation" />),
}));
jest.mock("@features/academic/services/academic.service", () => ({
  fetchAcademicSpace: jest.fn(),
  fetchAcademicSpaces: jest.fn(),
  fetchAcademicYear: jest.fn(),
  fetchAcademicYears: jest.fn(),
  fetchInstrument: jest.fn(),
  fetchInstruments: jest.fn(),
  fetchStudyPlan: jest.fn(),
  fetchStudyPlans: jest.fn(),
  fetchTrainingPath: jest.fn(),
  fetchTrainingPaths: jest.fn(),
}));

import { render } from "@testing-library/react";

import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { AcademicTableFilters } from "@features/academic/components/academic-table-filters";
import { AcademicTablePresentation } from "@features/academic/components/academic-table-presentation";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { fetchStudyPlans, fetchTrainingPath } from "@features/academic/services/academic.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const FIXED_TRAINING_PATH_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";
const OTHER_TRAINING_PATH_ID = "a755b72b-04b7-4255-8bca-243f391155cc";

describe("AcademicCollectionView", () => {
  beforeEach(() => {
    jest.mocked(fetchStudyPlans).mockResolvedValue({
      items: [],
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it("keeps contextual study-plan queries fixed and hides the redundant path filter", async () => {
    const result = await AcademicCollectionView({
      basePath: "",
      canCreate: true,
      canDelete: true,
      canChangeStatus: true,
      canUpdate: true,
      canRestore: true,
      columns: {
        primaryLabel: "Nombre",
        detailLabels: ["Vigente desde", "Vigente hasta"],
        sortableFields: ["name", "effectiveFrom", "effectiveTo"],
      },
      fixedTrainingPathId: FIXED_TRAINING_PATH_ID,
      institutionId: INSTITUTION_ID,
      resource: AcademicResource.STUDY_PLAN,
      scope: AcademicScope.INSTITUTIONAL,
      searchParams: {
        size: "20",
        trainingPathId: OTHER_TRAINING_PATH_ID,
      },
    });

    render(result);

    expect(fetchStudyPlans).toHaveBeenCalledWith(
      AcademicScope.INSTITUTIONAL,
      INSTITUTION_ID,
      expect.objectContaining({
        size: 20,
        trainingPathId: FIXED_TRAINING_PATH_ID,
      }),
    );
    expect(fetchTrainingPath).not.toHaveBeenCalled();
    expect(jest.mocked(AcademicTableFilters)).toHaveBeenCalledWith(expect.objectContaining({ trainingPathFilter: undefined }), undefined);
    expect(jest.mocked(AcademicTablePresentation)).toHaveBeenCalledWith(
      expect.objectContaining({
        hasFilters: false,
        columns: {
          primaryLabel: "Nombre",
          detailLabels: ["Vigente desde", "Vigente hasta"],
          sortableFields: ["name", "effectiveFrom", "effectiveTo"],
        },
      }),
      undefined,
    );
  });

  it("loads a global collection with the institution filter and global table mode", async () => {
    const createAction = <button type="button">Nuevo registro</button>;
    const result = await AcademicCollectionView({
      basePath: "/admin",
      canCreate: false,
      canDelete: true,
      canChangeStatus: true,
      canUpdate: true,
      createAction,
      canRestore: true,
      global: true,
      institutionName: "Conservatorio",
      resource: AcademicResource.STUDY_PLAN,
      scope: AcademicScope.ADMIN,
      searchParams: { institutionId: INSTITUTION_ID },
    });

    render(result);

    expect(fetchStudyPlans).toHaveBeenCalledWith(AcademicScope.ADMIN, undefined, expect.objectContaining({ institutionId: INSTITUTION_ID }));
    expect(jest.mocked(AcademicTableFilters)).toHaveBeenCalledWith(
      expect.objectContaining({ institutionFilter: { selectedLabel: "Conservatorio", value: INSTITUTION_ID } }),
      undefined,
    );
    expect(jest.mocked(AcademicTablePresentation)).toHaveBeenCalledWith(expect.objectContaining({ createAction, global: true }), undefined);
  });

  it("removes the redundant training-path value from contextual study-plan rows", async () => {
    jest.mocked(AcademicTablePresentation).mockClear();
    jest.mocked(fetchStudyPlans).mockResolvedValue({
      items: [
        {
          id: "2d9ec931-453c-4778-86a9-dc40a06d0247",
          institutionId: INSTITUTION_ID,
          trainingPathId: FIXED_TRAINING_PATH_ID,
          trainingPathName: "CAV Básico",
          name: "Plan 2026",
          effectiveFrom: "2026-03-03",
          effectiveTo: null,
          status: "DRAFT",
        },
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
    });

    const result = await AcademicCollectionView({
      basePath: "",
      canCreate: true,
      canDelete: true,
      canChangeStatus: true,
      canUpdate: true,
      canRestore: true,
      columns: {
        primaryLabel: "Nombre",
        detailLabels: ["Vigente desde", "Vigente hasta"],
        sortableFields: ["name", "effectiveFrom", "effectiveTo"],
      },
      fixedTrainingPathId: FIXED_TRAINING_PATH_ID,
      institutionId: INSTITUTION_ID,
      resource: AcademicResource.STUDY_PLAN,
      scope: AcademicScope.INSTITUTIONAL,
      searchParams: { size: "20" },
    });
    render(result);

    expect(jest.mocked(AcademicTablePresentation).mock.calls.at(-1)?.[0]).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          items: [
            expect.objectContaining({
              detailValues: ["03/03/2026", "Sin definir"],
            }),
          ],
        }),
      }),
    );
  });

  it("maps academic-space descriptions into their table column", () => {
    const config = ACADEMIC_COLLECTION_CONFIG[AcademicResource.ACADEMIC_SPACE];

    expect(config.columns.detailLabels).toEqual(["Tipo", "Formato", "Descripción"]);
    expect(
      config.toRow({
        id: "2d9ec931-453c-4778-86a9-dc40a06d0247",
        institutionId: INSTITUTION_ID,
        name: "Armonía",
        description: null,
        type: "SUBJECT",
        format: "INDIVIDUAL",
        active: true,
      }).detailValues,
    ).toEqual(["Asignatura", "Individual", "Sin descripción"]);
  });

  it("shows deleted records without offering a create action", async () => {
    const result = await AcademicCollectionView({
      basePath: "",
      canCreate: true,
      canDelete: true,
      canChangeStatus: true,
      canUpdate: true,
      canRestore: true,
      institutionId: INSTITUTION_ID,
      resource: AcademicResource.STUDY_PLAN,
      scope: AcademicScope.INSTITUTIONAL,
      searchParams: { deleted: "true" },
    });

    render(result);

    expect(fetchStudyPlans).toHaveBeenLastCalledWith(AcademicScope.INSTITUTIONAL, INSTITUTION_ID, expect.objectContaining({ deleted: true }));
    expect(jest.mocked(AcademicTablePresentation)).toHaveBeenLastCalledWith(expect.objectContaining({ canCreate: true, deleted: true }), undefined);
  });
});
