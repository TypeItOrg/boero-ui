import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnrollmentStudyPlanSpacesSelector } from "./EnrollmentStudyPlanSpacesSelector";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

const MOCK_SPACES: StudyPlanSpace[] = [
  {
    id: "space-1",
    studyPlanId: "plan-1",
    academicSpaceId: "as-1",
    academicSpaceName: "Lenguaje Musical I",
    academicLevelId: null,
    academicLevelName: "Primer Año",
    requirementType: "REQUIRED",
    displayOrder: 1,
    approvalMode: "PROMOTION",
    requiresInstrument: false,
    allowedInstruments: [],
  },
  {
    id: "space-2",
    studyPlanId: "plan-1",
    academicSpaceId: "as-2",
    academicSpaceName: "Instrumento Principal I",
    academicLevelId: null,
    academicLevelName: "Primer Año",
    requirementType: "REQUIRED",
    displayOrder: 2,
    approvalMode: "PROMOTION",
    requiresInstrument: true,
    allowedInstruments: [
      { instrumentId: "inst-1", name: "Guitarra" },
      { instrumentId: "inst-2", name: "Violín" },
    ],
  },
];

describe("EnrollmentStudyPlanSpacesSelector", () => {
  it("renders loading indicator when isLoading is true", () => {
    render(
      <EnrollmentStudyPlanSpacesSelector
        studyPlanSpaces={[]}
        selectedStudyPlanSpaceIds={[]}
        selectedInstrumentIdsByStudyPlanSpaceId={{}}
        onToggleSpace={jest.fn()}
        onSelectInstrument={jest.fn()}
        isLoading
      />,
    );

    expect(screen.getByText(/cargando espacios académicos disponibles/i)).toBeInTheDocument();
  });

  it("renders empty state when no spaces are available", () => {
    render(
      <EnrollmentStudyPlanSpacesSelector
        studyPlanSpaces={[]}
        selectedStudyPlanSpaceIds={[]}
        selectedInstrumentIdsByStudyPlanSpaceId={{}}
        onToggleSpace={jest.fn()}
        onSelectInstrument={jest.fn()}
      />,
    );

    expect(screen.getByText(/no hay espacios curriculares disponibles/i)).toBeInTheDocument();
  });

  it("renders spaces and calls onToggleSpace on click", async () => {
    const handleToggle = jest.fn();

    render(
      <EnrollmentStudyPlanSpacesSelector
        studyPlanSpaces={MOCK_SPACES}
        selectedStudyPlanSpaceIds={["space-1"]}
        selectedInstrumentIdsByStudyPlanSpaceId={{}}
        onToggleSpace={handleToggle}
        onSelectInstrument={jest.fn()}
      />,
    );

    expect(screen.getByText("Lenguaje Musical I")).toBeInTheDocument();
    expect(screen.getByText("Instrumento Principal I")).toBeInTheDocument();

    const space2Button = screen.getByRole("checkbox", { name: /instrumento principal i/i });
    await userEvent.click(space2Button);

    expect(handleToggle).toHaveBeenCalledWith("space-2");
  });

  it("shows instrument selection when an instrumental space is selected", () => {
    render(
      <EnrollmentStudyPlanSpacesSelector
        studyPlanSpaces={MOCK_SPACES}
        selectedStudyPlanSpaceIds={["space-2"]}
        selectedInstrumentIdsByStudyPlanSpaceId={{}}
        onToggleSpace={jest.fn()}
        onSelectInstrument={jest.fn()}
      />,
    );

    expect(screen.getByText(/seleccioná un instrumento:/i)).toBeInTheDocument();
    expect(screen.getByText(/debés elegir un instrumento para cursar este espacio/i)).toBeInTheDocument();
  });
});
