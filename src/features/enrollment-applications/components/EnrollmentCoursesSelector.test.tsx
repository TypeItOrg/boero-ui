import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
    academicYear: 2026,
    eligibility: { eligible: true, requirements: [] },
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
    academicYear: 2026,
    eligibility: { eligible: true, requirements: [] },
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
  academicYear: 2026,
  eligibility: { eligible: true, requirements: [] },
  hasCapacity: true,
};

function renderSelector(selectedCourseIds: string[] = [], plainCourse = PLAIN_COURSE) {
  const onToggleCourse = jest.fn();
  const onToggleInstrumentGroup = jest.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <EnrollmentCoursesSelector
        applicationId="application-1"
        courses={[...INSTRUMENTAL_COURSES, plainCourse]}
        savedCourses={[]}
        selectedCourseIds={selectedCourseIds}
        onToggleCourse={onToggleCourse}
        onSelectInstrument={jest.fn()}
        pendingInstrumentGroups={[]}
        invalidInstrumentGroups={[]}
        onToggleInstrumentGroup={onToggleInstrumentGroup}
      />
    </QueryClientProvider>,
  );
  return { onToggleCourse, onToggleInstrumentGroup };
}

describe("EnrollmentCoursesSelector", () => {
  it("shows grouped instrumental courses and non-instrumental courses without a level", () => {
    renderSelector();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByRole("checkbox", { name: /Teoría musical/ })).toBeInTheDocument();
    expect(screen.getByText(/Sin nivel/)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("groups instruments by academic space and keeps the saved instrument selected", () => {
    const { onToggleInstrumentGroup } = renderSelector(["course-guitar"]);
    expect(screen.getByRole("checkbox", { name: /Instrumento individual/ })).toBeChecked();
    expect(screen.getByRole("combobox", { name: /Elegí tu instrumento/ })).toHaveTextContent("Guitarra");
    fireEvent.click(screen.getByRole("checkbox", { name: /Instrumento individual/ }));
    expect(onToggleInstrumentGroup).toHaveBeenCalledWith(INSTRUMENTAL_COURSES[0], false);
  });

  it("warns about selected non-instrumental courses without capacity and allows deselection", () => {
    const { onToggleCourse } = renderSelector(["course-theory"], { ...PLAIN_COURSE, hasCapacity: false });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    fireEvent.click(screen.getByRole("checkbox", { name: /Teoría musical/ }));
    expect(onToggleCourse).toHaveBeenCalledWith("course-theory", false);
  });
});
