import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnrollmentStartSelector } from "./EnrollmentStartSelector";
import type { EnrollmentStartStudyPlanOption, EnrollmentStartPeriodOption } from "./EnrollmentStartSelector";

describe("EnrollmentStartSelector", () => {
  const studyPlans: EnrollmentStartStudyPlanOption[] = [
    { id: "plan-1", name: "Piano", trainingPathName: "Instrumento" },
    { id: "plan-2", name: "Canto", trainingPathName: "Instrumento" },
  ];

  const periods: EnrollmentStartPeriodOption[] = [
    { id: "period-1", academicYearId: "year-1", academicYearNumber: 2026, name: "Inscripción 2026" },
    { id: "period-2", academicYearId: "year-2", academicYearNumber: 2027, name: "Inscripción 2027" },
  ];

  it("pre-selects the first study plan and period but lets the applicant change them", () => {
    const onStart = jest.fn();
    render(<EnrollmentStartSelector studyPlans={studyPlans} periods={periods} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: /comenzar inscripción/i }));

    expect(onStart).toHaveBeenCalledWith({ studyPlanId: "plan-1", academicYearId: "year-1" });
  });

  it("does not render when there are no study plans or no open periods", () => {
    const { container } = render(<EnrollmentStartSelector studyPlans={[]} periods={periods} onStart={jest.fn()} />);
    expect(container).toHaveTextContent(/no hay planes de estudio/i);
  });
});
