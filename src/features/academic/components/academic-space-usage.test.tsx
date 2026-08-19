jest.mock("next/navigation", () => ({
  usePathname: () => "/academic-spaces/space-1",
  useSearchParams: () => new URLSearchParams(),
}));

import { render, screen, within } from "@testing-library/react";

import { AcademicSpaceUsage } from "@features/academic/components/academic-space-usage";
import type { AcademicSpaceUsage as AcademicSpaceUsageData } from "@features/academic/types/academic-space-usage.types";

const USAGE: AcademicSpaceUsageData = {
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
    items: [
      {
        studyPlanId: "plan-1",
        name: "Plan 2026",
        trainingPathName: "Tecnicatura en Música",
        effectiveFrom: "2026-03-01",
        effectiveTo: null,
        status: "ACTIVE",
        placements: [
          {
            studyPlanSpaceId: "plan-space-1",
            academicLevelId: "level-1",
            academicLevelName: "Primer año",
            requirementType: "REQUIRED",
            approvalMode: "PROMOTION",
            displayOrder: 1,
          },
        ],
      },
    ],
    page: 0,
    size: 10,
    totalItems: 1,
    totalPages: 1,
  },
  warnings: [{ code: "USED_IN_ACTIVE_OR_DRAFT_PLAN", blockingPlanCount: 1 }],
};

describe("AcademicSpaceUsage", () => {
  it("shows summary, operational warning and curricular placement", () => {
    render(<AcademicSpaceUsage basePath="" usage={USAGE} />);

    const section = screen.getByRole("region", { name: "Uso en planes de estudio" });

    expect(within(section).getByText("Planes asociados").parentElement).toHaveTextContent("1");
    expect(within(section).getByText("En operación").parentElement).toHaveTextContent("1");
    expect(within(section).queryByText("No se puede desactivar este espacio")).not.toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "Plan 2026" })).toHaveAttribute(
      "href",
      "/study-plans/plan-1?returnTo=%2Facademic-spaces%2Fspace-1",
    );
    expect(within(section).getByText("Primer año")).toBeInTheDocument();
    expect(within(section).getByText("Obligatorio")).toBeInTheDocument();
    expect(within(section).getByText("Promoción")).toBeInTheDocument();
    expect(within(section).queryByText("En uso operativo")).not.toBeInTheDocument();
  });

  it("shows a useful empty state when the space has no plan usage", () => {
    render(
      <AcademicSpaceUsage
        basePath=""
        usage={{
          ...USAGE,
          summary: {
            ...USAGE.summary,
            totalPlans: 0,
            activePlans: 0,
            totalPlacements: 0,
            deactivationBlocked: false,
          },
          plans: { ...USAGE.plans, items: [], totalItems: 0, totalPages: 0 },
          warnings: [],
        }}
      />,
    );

    expect(screen.getByText("Este espacio todavía no está incorporado a ningún plan")).toBeInTheDocument();
    expect(screen.queryByText("Sin uso operativo")).not.toBeInTheDocument();
  });
});
