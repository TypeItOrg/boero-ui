jest.mock("next/navigation", () => ({
  usePathname: () => "/training-paths/2d9ec931-453c-4778-86a9-dc40a06d0247",
  useSearchParams: () => new URLSearchParams(),
}));
jest.mock("@features/academic/components/academic-collection", () => ({
  AcademicCollectionView: jest.fn(() => <div data-testid="academic-collection-view" />),
}));

import { render, screen } from "@testing-library/react";

import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { TrainingPathStudyPlans } from "@features/academic/components/training-path-study-plans";
import { FULL_ACADEMIC_ACCESS } from "@features/academic/types/academic-access.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const TRAINING_PATH_ID = "2d9ec931-453c-4778-86a9-dc40a06d0247";
const TRAINING_PATH = {
  id: TRAINING_PATH_ID,
  institutionId: INSTITUTION_ID,
  name: "Profesorado de Música",
  description: "Formación docente musical.",
  active: true,
};

describe("TrainingPathStudyPlans", () => {
  it("fixes the training path filter and exposes contextual plan creation", async () => {
    const result = await TrainingPathStudyPlans({
      access: FULL_ACADEMIC_ACCESS,
      basePath: "",
      institutionId: INSTITUTION_ID,
      scope: AcademicScope.INSTITUTIONAL,
      searchParams: {},
      trainingPath: TRAINING_PATH,
    });

    render(result);

    expect(screen.getByRole("heading", { name: "Planes de estudio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nuevo plan de estudio" })).toHaveAttribute(
      "href",
      `/study-plans/new?trainingPathId=${TRAINING_PATH_ID}&returnTo=%2Ftraining-paths%2F${TRAINING_PATH_ID}`,
    );
    expect(screen.getByTestId("academic-collection-view")).toBeInTheDocument();
    expect(jest.mocked(AcademicCollectionView)).toHaveBeenCalledWith(
      expect.objectContaining({
        fixedTrainingPathId: TRAINING_PATH_ID,
        resource: "study-plans",
      }),
      undefined,
    );
  });

  it("does not offer contextual creation without study-plan create permission", async () => {
    const result = await TrainingPathStudyPlans({
      access: { ...FULL_ACADEMIC_ACCESS, studyPlanCreate: false },
      basePath: "",
      institutionId: INSTITUTION_ID,
      scope: AcademicScope.INSTITUTIONAL,
      searchParams: {},
      trainingPath: TRAINING_PATH,
    });

    render(result);

    expect(screen.queryByRole("link", { name: "Nuevo plan de estudio" })).not.toBeInTheDocument();
  });
});
