import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnrollmentStartSelector } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import type {
  EnrollmentStartStudyPlanOption,
  EnrollmentStartPeriodOption,
} from "@features/enrollment-applications/components/EnrollmentStartSelector";

describe("EnrollmentStartSelector", () => {
  const studyPlans: EnrollmentStartStudyPlanOption[] = [
    { id: "plan-1", name: "Piano", trainingPathName: "Instrumento" },
    { id: "plan-2", name: "Canto", trainingPathName: "Instrumento" },
  ];

  const periods: EnrollmentStartPeriodOption[] = [
    { id: "period-1", academicYearId: "year-1", academicYearNumber: 2026, name: "Inscripción 2026" },
    { id: "period-2", academicYearId: "year-2", academicYearNumber: 2027, name: "Inscripción 2027" },
  ];

  it("pre-selects the first study plan and starts without an academic year", () => {
    const onStart = jest.fn();
    render(<EnrollmentStartSelector studyPlans={studyPlans} periods={periods} onStart={onStart} />);

    fireEvent.click(screen.getByRole("button", { name: /comenzar inscripción/i }));

    expect(onStart).toHaveBeenCalledWith({ trainingPathId: "plan-1" });
  });

  it("shows an informative message when there are no courses available", () => {
    const { container } = render(<EnrollmentStartSelector studyPlans={[]} periods={periods} onStart={jest.fn()} />);
    expect(container).toHaveTextContent(/no hay cursos a los que te puedas inscribir/i);
  });

  it("shows the plain training path name when it matches the option name", () => {
    render(
      <EnrollmentStartSelector
        studyPlans={[{ id: "path-1", name: "CAV Básico", trainingPathName: "CAV Básico" }]}
        periods={periods}
        onStart={jest.fn()}
      />,
    );
    expect(screen.getByRole("combobox", { name: /trayecto formativo/i })).toHaveTextContent("CAV Básico");
  });

  it("shows an informative message when there are no open enrollment periods", () => {
    const { container } = render(<EnrollmentStartSelector studyPlans={studyPlans} periods={[]} onStart={jest.fn()} />);
    expect(container).toHaveTextContent(/no hay períodos de inscripción abiertos/i);
  });
});
