import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnrollmentStart } from "./EnrollmentStart";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

jest.mock("./EnrollmentWizard", () => ({
  EnrollmentWizard: ({ studyPlanId, academicYearId }: { studyPlanId: string; academicYearId: string }) => (
    <div data-testid="wizard">
      wizard:{studyPlanId}:{academicYearId}
    </div>
  ),
}));

describe("EnrollmentStart", () => {
  const studyPlans: StudyPlan[] = [
    {
      id: "plan-1",
      institutionId: "inst-1",
      trainingPathId: "tp-1",
      trainingPathName: "Instrumento",
      name: "Piano",
      effectiveFrom: null,
      effectiveTo: null,
      status: "ACTIVE",
    },
  ];

  const periods: EnrollmentPeriod[] = [
    {
      id: "period-1",
      institutionId: "inst-1",
      academicYearId: "year-1",
      academicYearNumber: 2026,
      name: "Inscripción 2026",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "OPEN",
    },
  ];

  it("renders the wizard with the selected plan and year once the applicant confirms", () => {
    render(<EnrollmentStart studyPlans={studyPlans} periods={periods} />);

    fireEvent.click(screen.getByRole("button", { name: /comenzar inscripción/i }));

    expect(screen.getByTestId("wizard")).toHaveTextContent("wizard:plan-1:year-1");
  });

  it("shows an unavailable message when there are no options", () => {
    render(<EnrollmentStart studyPlans={[]} periods={[]} />);
    expect(screen.getByText(/inscripción no disponible/i)).toBeInTheDocument();
  });
});
