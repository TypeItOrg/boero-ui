import { render, screen, within } from "@testing-library/react";

import { StudyPlanCurriculumView } from "@features/academic/components/study-plan-curriculum";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

const INSTITUTION_ID = "05b84ac4-66aa-409f-a813-012d15b8cb9b";
const STUDY_PLAN_ID = "019f9c3d-9663-77da-a21b-5c811c040616";
const LEVEL_ID = "a755b72b-04b7-4255-8bca-243f391155cc";
const SPACE_ID = "0ff6437e-a651-488b-9982-9a988effaf43";

const CURRICULUM: StudyPlanCurriculum = {
  studyPlan: {
    id: STUDY_PLAN_ID,
    institutionId: INSTITUTION_ID,
    trainingPathId: "2d9ec931-453c-4778-86a9-dc40a06d0247",
    trainingPathName: "Profesorado de Música",
    name: "Plan 2026",
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    status: "DRAFT",
  },
  levels: [
    {
      level: {
        id: LEVEL_ID,
        studyPlanId: STUDY_PLAN_ID,
        name: "Nivel 1",
        displayOrder: 1,
        description: null,
      },
      spaces: [
        {
          id: SPACE_ID,
          studyPlanId: STUDY_PLAN_ID,
          academicSpaceId: "cdaac468-2a09-446d-a8af-e6c2f3428740",
          academicSpaceName: "Lenguaje Musical I",
          academicLevelId: LEVEL_ID,
          academicLevelName: "Nivel 1",
          requirementType: "REQUIRED",
          displayOrder: 1,
          approvalMode: "PROMOTION",
        },
      ],
    },
  ],
  unassignedSpaces: [],
  prerequisites: [],
};

describe("StudyPlanCurriculumView", () => {
  it("places level deletion immediately after its edit action", () => {
    render(
      <StudyPlanCurriculumView
        curriculum={CURRICULUM}
        basePath=""
        canEditCurriculum
        institutionId={INSTITUTION_ID}
        scope={AcademicScope.INSTITUTIONAL}
      />,
    );

    const editAction = screen.getByRole("link", { name: "Editar nivel" });
    const levelHeader = editAction.closest("header");
    const deleteAction = within(levelHeader as HTMLElement).getByRole("button", { name: "Eliminar" });

    expect(editAction).toHaveAttribute("href", `/study-plans/${STUDY_PLAN_ID}/academic-levels/${LEVEL_ID}/edit`);
    expect(editAction.compareDocumentPosition(deleteAction)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("hides level actions when the curriculum cannot be edited", () => {
    render(
      <StudyPlanCurriculumView
        curriculum={CURRICULUM}
        basePath=""
        canEditCurriculum={false}
        institutionId={INSTITUTION_ID}
        scope={AcademicScope.INSTITUTIONAL}
      />,
    );

    expect(screen.queryByRole("link", { name: "Editar nivel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument();
  });

  it("shows the space order instead of an arrow without hover effects", () => {
    render(
      <StudyPlanCurriculumView
        curriculum={CURRICULUM}
        basePath=""
        canEditCurriculum
        institutionId={INSTITUTION_ID}
        scope={AcademicScope.INSTITUTIONAL}
      />,
    );

    const spaceLink = screen.getByRole("link", { name: /Lenguaje Musical I/ });
    const card = spaceLink.closest('[data-slot="card"]');
    const order = screen.getByText("Orden 1");

    expect(order.closest('[data-slot="card-header"]')).toBeInTheDocument();
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass("group", "transition", "hover:shadow-sm");
    expect(card?.className).not.toContain("hover:");
    expect(spaceLink.querySelector("svg")).not.toBeInTheDocument();
  });

  it("offers direct edit and delete actions on each space card", () => {
    render(
      <StudyPlanCurriculumView
        curriculum={CURRICULUM}
        basePath=""
        canEditCurriculum
        institutionId={INSTITUTION_ID}
        scope={AcademicScope.INSTITUTIONAL}
      />,
    );

    const detailLink = screen.getByRole("link", { name: /Lenguaje Musical I/ });
    const card = detailLink.closest('[data-slot="card"]') as HTMLElement;
    const editAction = within(card).getByRole("link", { name: "Editar" });
    const deleteAction = within(card).getByRole("button", { name: "Eliminar" });

    expect(detailLink).toHaveAttribute("href", `/study-plans/${STUDY_PLAN_ID}/spaces/${SPACE_ID}`);
    expect(editAction).toHaveAttribute(
      "href",
      `/study-plans/${STUDY_PLAN_ID}/spaces/${SPACE_ID}/edit?returnTo=%2Fstudy-plans%2F${STUDY_PLAN_ID}`,
    );
    expect(deleteAction).toBeEnabled();
  });
});
