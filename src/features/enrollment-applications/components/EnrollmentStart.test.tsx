import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
import { startOrGetEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@features/enrollment-applications/actions/enrollment-application.actions", () => ({
  startOrGetEnrollmentApplicationAction: jest.fn(),
}));

const startAction = jest.mocked(startOrGetEnrollmentApplicationAction);

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

  beforeEach(() => {
    mockPush.mockReset();
    startAction.mockReset();
  });

  it("starts the selected application and navigates to its detail", async () => {
    startAction.mockResolvedValue({ application: { applicationId: "app-1" } } as Awaited<ReturnType<typeof startOrGetEnrollmentApplicationAction>>);
    render(<EnrollmentStart studyPlans={studyPlans} periods={periods} />);

    fireEvent.click(screen.getByRole("button", { name: /comenzar inscripción/i }));

    await waitFor(() => expect(startAction).toHaveBeenCalledWith({ studyPlanId: "plan-1", academicYearId: "year-1" }));
    expect(mockPush).toHaveBeenCalledWith("/my-enrollment-applications/app-1");
  });

  it("shows an unavailable message when there are no options", () => {
    render(<EnrollmentStart studyPlans={[]} periods={[]} />);
    expect(screen.getByText("No hay períodos de inscripción abiertos")).toBeInTheDocument();
  });
});
