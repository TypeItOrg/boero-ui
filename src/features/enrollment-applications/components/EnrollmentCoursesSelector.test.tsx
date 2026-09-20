import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EnrollmentCoursesSelector } from "@features/enrollment-applications/components/EnrollmentCoursesSelector";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

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

function renderSelector(selectedCourseIds: string[] = [], plainCourse = PLAIN_COURSE) {
  const onToggleCourse = jest.fn();
  render(
    <EnrollmentCoursesSelector
      courses={[...INSTRUMENTAL_COURSES, plainCourse]}
      selectedCourseIds={selectedCourseIds}
      onToggleCourse={onToggleCourse}
    />,
  );
  return onToggleCourse;
}

describe("EnrollmentCoursesSelector", () => {
  it("shows every course including non-instrumental courses without a level", () => {
    renderSelector();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: /Teoría musical/ })).toBeInTheDocument();
    expect(screen.getByText(/Sin nivel/)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("selects exact instrumental courses independently even when they share an academic space", () => {
    const onToggleCourse = renderSelector(["course-guitar"]);
    expect(screen.getByRole("checkbox", { name: /Guitarra/ })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: /Bajo/ }));
    expect(onToggleCourse).toHaveBeenCalledWith("course-bass", true);
  });

  it("allows requesting non-instrumental courses without capacity and displays the warning", () => {
    const onToggleCourse = renderSelector([], { ...PLAIN_COURSE, hasCapacity: false });
    expect(screen.getAllByRole("status")).toHaveLength(2);
    fireEvent.click(screen.getByRole("checkbox", { name: /Teoría musical/ }));
    expect(onToggleCourse).toHaveBeenCalledWith("course-theory", true);
  });
});
