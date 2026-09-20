import * as React from "react";
import { render, screen } from "@testing-library/react";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("EnrollmentStatusCard", () => {
  const baseApp: EnrollmentApplicationResponse = {
    applicationId: "019183ab-0000-7000-8000-000000000001",
    institutionId: "019183ab-0000-7000-8000-000000000002",
    personId: "019183ab-0000-7000-8000-000000000003",
    studyPlanId: "019183ab-0000-7000-8000-000000000004",
    academicYearId: "019183ab-0000-7000-8000-000000000005",
    enrollmentPeriodId: "019183ab-0000-7000-8000-000000000006",
    status: "SUBMITTED",
    isEditable: false,
    createdAt: "2026-08-28T21:30:00Z",
    updatedAt: "2026-08-28T21:30:00Z",
    data: {
      personalData: {
        firstName: "Lucas",
        lastName: "Mendoza",
        documentNumber: "42111222",
        birthDate: "2002-04-10",
        phoneNumber: "3534999888",
        email: "lucas@example.com",
      },
      academicBackground: {
        secondarySchool: "Colegio Nacional",
        secondaryCompleted: true,
        currentGradeYear: "2020",
        secondaryDegreeTitle: "Bachiller",
      },
      healthInclusion: {
        receivesReasonableAdjustments: false,
      },
      responsible: {},
      preference: {
        preferredShift: "MORNING",
        allowsImageUse: true,
        isReenrolling: false,
      },
      attachments: [
        {
          id: "att-1",
          attachmentType: "DNI_FRONT",
          originalFileName: "dni-frente.png",
          size: 1024 * 500,
        },
      ],
    },
  };

  it("renders status SUBMITTED with description and applicant name", () => {
    render(<EnrollmentStatusCard application={baseApp} />);
    expect(screen.getByText("Solicitud en revisión")).toBeInTheDocument();
    expect(screen.getByText("Enviada")).toBeInTheDocument();
    expect(screen.getByText("Lucas Mendoza")).toBeInTheDocument();
    expect(screen.getByText("42111222")).toBeInTheDocument();
    expect(screen.getByText("Colegio Nacional")).toBeInTheDocument();
    expect(screen.getByText("dni-frente.png")).toBeInTheDocument();
  });

  it("renders status APPROVED banner when approved", () => {
    const approvedApp = { ...baseApp, status: "APPROVED" as const };
    render(<EnrollmentStatusCard application={approvedApp} />);
    expect(screen.getByText("Solicitud aprobada")).toBeInTheDocument();
  });

  it("renders status REJECTED banner when rejected", () => {
    const rejectedApp = { ...baseApp, status: "REJECTED" as const };
    render(<EnrollmentStatusCard application={rejectedApp} />);
    expect(screen.getByText("Solicitud no admitida")).toBeInTheDocument();
  });

  it("renders status CANCELLED banner when cancelled", () => {
    const cancelledApp = { ...baseApp, status: "CANCELLED" as const };
    render(<EnrollmentStatusCard application={cancelledApp} />);
    expect(screen.getByText("Solicitud cancelada")).toBeInTheDocument();
  });

  it("hides the legacy spaces card when the application has no spaces", () => {
    render(<EnrollmentStatusCard application={baseApp} />);
    expect(screen.queryByText("Trayecto formativo y espacios académicos")).not.toBeInTheDocument();
  });

  it("keeps the legacy spaces card for applications with spaces", () => {
    const legacyApp = {
      ...baseApp,
      spaces: [
        {
          studyPlanSpaceId: "space-1",
          spaceName: "Lenguaje Musical",
          academicLevelName: "Nivel 1",
          instrumentId: null,
          instrumentName: null,
        },
      ],
    };
    render(<EnrollmentStatusCard application={legacyApp} />);
    expect(screen.getByText("Trayecto formativo y espacios académicos")).toBeInTheDocument();
    expect(screen.getByText("Lenguaje Musical")).toBeInTheDocument();
  });

  it("shows selected courses read-only to reviewers before approval", () => {
    const submittedApp = {
      ...baseApp,
      courses: [
        {
          applicationCourseId: "course-1",
          courseId: "c-1",
          studyPlanSpaceId: "space-1",
          academicSpaceName: "Instrumento individual",
          academicLevelName: "Nivel 1",
          studyPlanName: "Plan 2026",
          trainingPathName: "CAV Básico",
          instrumentId: "i-1",
          instrumentName: "Guitarra",
          preferredTeacherId: null,
          status: "PENDING" as const,
          requestedAt: null,
          submittedWithCapacity: null,
          waitlistNumber: null,
          waitlistedAt: null,
          waitlistReason: null,
          resolvedAt: null,
          resolvedByPersonId: null,
          resolutionReasonCode: null,
          resolutionReasonText: null,
          version: 1,
        },
      ],
    };
    render(<EnrollmentStatusCard application={submittedApp} canManageCourses />);
    expect(screen.getByText("Solicitudes de cursada")).toBeInTheDocument();
    expect(screen.getByText("Instrumento individual")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Inscribir" })).not.toBeInTheDocument();
  });
});
