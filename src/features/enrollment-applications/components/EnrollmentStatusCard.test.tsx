import * as React from "react";
import { render, screen } from "@testing-library/react";
import { EnrollmentStatusCard } from "./EnrollmentStatusCard";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

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
        address: "Belgrano 789",
        city: "Villa María",
        phone: "3534999888",
        email: "lucas@example.com",
      },
      educationBackground: {
        secondarySchool: "Colegio Nacional",
        isSecondaryComplete: true,
        graduationYear: "2020",
        secondaryTitle: "Bachiller",
      },
      healthInclusion: {
        requiresSupport: false,
      },
      responsible: {},
      preferences: {
        preferredShift: "MORNING",
        imageAuthorization: true,
        isReentering: false,
      },
      attachments: [
        {
          id: "att-1",
          documentType: "DNI_FRONT",
          fileName: "dni-frente.png",
          fileSize: 1024 * 500,
        },
      ],
    },
  };

  it("renders status SUBMITTED with description and applicant name", () => {
    render(<EnrollmentStatusCard application={baseApp} />);
    expect(screen.getByText("Estado de tu Solicitud de Inscripción")).toBeInTheDocument();
    expect(screen.getByText("Enviada")).toBeInTheDocument();
    expect(screen.getByText("Lucas Mendoza")).toBeInTheDocument();
    expect(screen.getByText("42111222")).toBeInTheDocument();
    expect(screen.getByText("Colegio Nacional")).toBeInTheDocument();
    expect(screen.getByText("dni-frente.png")).toBeInTheDocument();
  });

  it("renders status APPROVED banner when approved", () => {
    const approvedApp = { ...baseApp, status: "APPROVED" as const };
    render(<EnrollmentStatusCard application={approvedApp} />);
    expect(screen.getByText("¡Solicitud Aprobada!")).toBeInTheDocument();
  });

  it("renders status REJECTED banner when rejected", () => {
    const rejectedApp = { ...baseApp, status: "REJECTED" as const };
    render(<EnrollmentStatusCard application={rejectedApp} />);
    expect(screen.getByText("Solicitud no admitida")).toBeInTheDocument();
  });

  it("renders status CANCELLED banner when cancelled", () => {
    const cancelledApp = { ...baseApp, status: "CANCELLED" as const };
    render(<EnrollmentStatusCard application={cancelledApp} />);
    expect(screen.getByText("Solicitud Cancelada")).toBeInTheDocument();
  });
});
