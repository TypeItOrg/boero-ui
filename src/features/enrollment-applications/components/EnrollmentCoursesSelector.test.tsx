import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EnrollmentCoursesSelector } from "@features/enrollment-applications/components/EnrollmentCoursesSelector";
import type { EnrollmentCourseGroupSelection, EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

const INSTRUMENTAL_COURSES: EnrollmentCourseOption[] = [
  {
    courseId: "course-guitar",
    studyPlanSpaceId: "space-1",
    academicSpaceName: "Instrumento individual",
    academicLevelName: "Nivel 1",
    studyPlanName: "PLAN DE TESTING 1",
    trainingPathName: "CAV Básico",
    format: "INDIVIDUAL",
    instrumentId: "instrument-guitar",
    instrumentName: "Guitarra",
    requirementType: "REQUIRED",
    approvalMode: "PROMOTION",
    instrumental: true,
    hasCapacity: true,
  },
  {
    courseId: "course-bass",
    studyPlanSpaceId: "space-1",
    academicSpaceName: "Instrumento individual",
    academicLevelName: "Nivel 1",
    studyPlanName: "PLAN DE TESTING 1",
    trainingPathName: "CAV Básico",
    format: "INDIVIDUAL",
    instrumentId: "instrument-bass",
    instrumentName: "Bajo",
    requirementType: "REQUIRED",
    approvalMode: "PROMOTION",
    instrumental: true,
    hasCapacity: false,
  },
];

const PLAIN_COURSE: EnrollmentCourseOption = {
  courseId: "course-theory",
  studyPlanSpaceId: "space-2",
  academicSpaceName: "Teoría musical",
  academicLevelName: null,
  studyPlanName: "PLAN DE TESTING 1",
  trainingPathName: "CAV Básico",
  format: "GRUPAL",
  instrumentId: null,
  instrumentName: null,
  requirementType: "REQUIRED",
  approvalMode: "PROMOTION",
  instrumental: false,
  hasCapacity: true,
};

function renderSelector(selection: EnrollmentCourseGroupSelection[] = [], error?: string) {
  const handlers = {
    onToggleGroup: jest.fn(),
    onSelectInstrument: jest.fn(),
    onSelectCourse: jest.fn(),
  };
  render(<EnrollmentCoursesSelector courses={[...INSTRUMENTAL_COURSES, PLAIN_COURSE]} selection={selection} error={error} {...handlers} />);
  return handlers;
}

describe("EnrollmentCoursesSelector", () => {
  it("renders one checkbox per group with requirement metadata", () => {
    renderSelector();

    expect(screen.getByText("Instrumento individual")).toBeInTheDocument();
    expect(screen.getByText("Teoría musical")).toBeInTheDocument();
    expect(screen.getByText("Nivel 1 · Obligatorio · Promoción · Requiere instrumento")).toBeInTheDocument();
    expect(screen.getByText("Sin nivel · Obligatorio · Promoción")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("toggles the group when its checkbox changes", () => {
    const { onToggleGroup } = renderSelector();

    fireEvent.click(screen.getByRole("checkbox", { name: /Instrumento individual/ }));
    expect(onToggleGroup).toHaveBeenCalledWith("space-1", true);
  });

  it("reveals the instrument dropdown once an instrumental group is checked", () => {
    renderSelector([{ studyPlanSpaceId: "space-1", courseId: null }]);

    expect(screen.getByRole("combobox", { name: /instrumento/i })).toBeInTheDocument();
  });

  it("resolves the exact course when an instrument is picked", () => {
    const { onSelectInstrument } = renderSelector([{ studyPlanSpaceId: "space-1", courseId: null }]);

    fireEvent.click(screen.getByRole("combobox", { name: /instrumento/i }));
    fireEvent.click(screen.getByRole("option", { name: "Bajo" }));

    expect(onSelectInstrument).toHaveBeenCalledWith("space-1", "course-bass");
  });

  it("checks a non-instrumental group directly without a dropdown", () => {
    const { onToggleGroup } = renderSelector();

    fireEvent.click(screen.getByRole("checkbox", { name: /Teoría musical/ }));
    expect(onToggleGroup).toHaveBeenCalledWith("space-2", true);
  });

  it("asks for an instrument per checked group when submitting without one", () => {
    renderSelector([{ studyPlanSpaceId: "space-1", courseId: null }], "Debés seleccionar al menos un espacio curricular.");

    expect(screen.getByText("Seleccioná un instrumento para este espacio.")).toBeInTheDocument();
  });
});
