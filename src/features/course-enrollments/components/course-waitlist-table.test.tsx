import { fireEvent, render, screen } from "@testing-library/react";
import { CourseWaitlistTable } from "@features/course-enrollments/components/course-waitlist-table";
import type { CourseWaitlistEntry } from "@features/course-enrollments/types/course-waitlist-entry.types";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
jest.mock("@features/enrollment-applications/components/enrollment-application-courses-management", () => ({
  EnrollmentApplicationCourseDialog: ({ applicationId }: { applicationId: string }) => <div role="dialog">Solicitud {applicationId}</div>,
}));

const ENTRY: CourseWaitlistEntry = {
  trainingPathId: "training-path-id",
  applicationId: "parent-1",
  applicationCourseId: "child-1",
  courseId: "course-1",
  hasCapacity: true,
  waitlistNumber: 1,
  applicantName: "Ana Pérez",
  applicantDocumentNumber: "12345678",
  requestedAt: "2026-09-01T12:00:00Z",
  waitlistedAt: "2026-09-02T12:00:00Z",
  originalReason: "NO_CAPACITY_AT_PARENT_APPROVAL",
  currentSituation: "WAITLISTED",
  preferredShift: null,
  preferredTeacherId: null,
  applicationCourse: {
    applicationCourseId: "child-1",
    courseId: "course-1",
    studyPlanSpaceId: "space-1",
    academicSpaceName: "Teoría",
    academicLevelName: null,
    studyPlanName: "Plan",
    trainingPathName: "Trayecto",
    instrumentId: null,
    instrumentName: null,
    preferredTeacherId: null,
    status: "WAITLISTED",
    requestedAt: "2026-09-01T12:00:00Z",
    submittedWithCapacity: false,
    waitlistNumber: 1,
    waitlistedAt: "2026-09-02T12:00:00Z",
    waitlistReason: "NO_CAPACITY_AT_PARENT_APPROVAL",
    resolvedAt: null,
    resolvedByPersonId: null,
    resolutionReasonCode: null,
    resolutionReasonText: null,
    version: 1,
  },
};

describe("CourseWaitlistTable", () => {
  it("keeps a free seat until an authorized user explicitly opens the acceptance flow", () => {
    render(<CourseWaitlistTable entries={[ENTRY]} canEnroll />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Incorporar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("parent-1");
  });

  it("blocks incorporation without capacity", () => {
    render(<CourseWaitlistTable entries={[{ ...ENTRY, hasCapacity: false }]} canEnroll />);
    expect(screen.getByRole("button", { name: "Incorporar" })).toBeDisabled();
  });

  it("does not offer incorporation without permission", () => {
    render(<CourseWaitlistTable entries={[ENTRY]} />);
    expect(screen.queryByRole("button", { name: "Incorporar" })).not.toBeInTheDocument();
  });
});
