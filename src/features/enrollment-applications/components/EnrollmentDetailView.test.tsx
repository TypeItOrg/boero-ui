import * as React from "react";
import { render, screen } from "@testing-library/react";
import { EnrollmentDetailView } from "./EnrollmentDetailView";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

describe("EnrollmentDetailView", () => {
  const sampleApplication: EnrollmentApplicationResponse = {
    applicationId: "app-abc-123",
    institutionId: "inst-1",
    personId: "person-1",
    studyPlanId: "plan-1",
    academicYearId: "year-1",
    enrollmentPeriodId: "period-1",
    status: "SUBMITTED",
    isEditable: false,
    data: {
      personalData: {
        firstName: "Lucas",
        lastName: "Martínez",
        documentNumber: "42123456",
        birthDate: "2004-08-12",
        phoneNumber: "3534123456",
        email: "lucas@example.com",
      },
      academicBackground: {
        secondarySchool: "Colegio Nacional",
        currentGradeYear: "2022",
        secondaryCompleted: true,
        secondaryDegreeTitle: "Bachiller en Ciencias Sociales",
      },
      healthInclusion: {
        receivesReasonableAdjustments: true,
        adjustmentDetails: "Requiere acceso por rampa para silla de ruedas",
      },
      responsible: {
        fullName: "Carlos Martínez",
        documentNumber: "18123456",
        phoneNumber: "3534987654",
        email: "carlos@example.com",
        occupation: "Comerciante",
        educationLevel: "Secundario Completo",
      },
      preference: {
        preferredShift: "MORNING",
        allowsImageUse: true,
        isReenrolling: false,
        previousTeacher: "Prof. Alberto Rossi",
      },
      attachments: [
        {
          id: "att-1",
          attachmentType: "DNI_FRONT",
          originalFileName: "dni_frente.pdf",
          size: 1048576,
        },
      ],
    },
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
  };

  it("renders header summary and keeps Approve/Reject disabled pending CSMFB-128/129", () => {
    render(<EnrollmentDetailView application={sampleApplication} studyPlanName="Profesorado de Música" academicYearName="2026" />);

    expect(screen.getByText("Lucas Martínez")).toBeInTheDocument();
    expect(screen.getAllByText("42123456").length).toBeGreaterThan(0);
    expect(screen.getByText("Profesorado de Música")).toBeInTheDocument();
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);

    // Aprobar/Rechazar quedan visibles pero deshabilitados: la decisión de negocio
    // (CSMFB-128/129) todavía no tiene endpoint ni dueño en ninguno de los dos repos.
    const approveBtn = screen.getByRole("button", { name: /aprobar inscripción/i });
    const rejectBtn = screen.getByRole("button", { name: /rechazar/i });
    expect(approveBtn).toBeDisabled();
    expect(rejectBtn).toBeDisabled();
  });

  it("renders all 6 ABM stylized card sections", () => {
    render(<EnrollmentDetailView application={sampleApplication} />);

    // 1. Datos Personales
    expect(screen.getByText("Datos Personales y de Contacto")).toBeInTheDocument();
    expect(screen.getByText("3534123456")).toBeInTheDocument();
    expect(screen.getByText("lucas@example.com")).toBeInTheDocument();

    // 2. Trayectoria Educativa
    expect(screen.getByText("Trayectoria Educativa")).toBeInTheDocument();
    expect(screen.getByText("Colegio Nacional")).toBeInTheDocument();
    expect(screen.getByText("Bachiller en Ciencias Sociales")).toBeInTheDocument();

    // 3. Salud e Inclusión
    expect(screen.getByText("Salud e Inclusión")).toBeInTheDocument();
    expect(screen.getByText("Requiere ajustes razonables")).toBeInTheDocument();
    expect(screen.getByText("Requiere acceso por rampa para silla de ruedas")).toBeInTheDocument();

    // 4. Responsable Legal / Tutor
    expect(screen.getByText("Responsable Legal / Tutor")).toBeInTheDocument();
    expect(screen.getByText("Carlos Martínez")).toBeInTheDocument();
    expect(screen.getByText("Comerciante")).toBeInTheDocument();

    // 5. Preferencias y Autorizaciones
    expect(screen.getByText("Preferencias y Autorizaciones")).toBeInTheDocument();
    expect(screen.getByText("Mañana")).toBeInTheDocument();
    expect(screen.getByText("Autorizado")).toBeInTheDocument();
    expect(screen.getByText("Prof. Alberto Rossi")).toBeInTheDocument();

    // 6. Documentación Adjunta
    expect(screen.getByText("Documentación Adjunta")).toBeInTheDocument();
    expect(screen.getByText(/dni_frente\.pdf/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /descargar/i })).toHaveAttribute(
      "href",
      "/api/enrollment-applications/app-abc-123/attachments/att-1/content",
    );
  });

  it("handles empty / default states for optional sections", () => {
    const emptyApp: EnrollmentApplicationResponse = {
      applicationId: "app-empty",
      institutionId: "inst-1",
      personId: "person-1",
      studyPlanId: "plan-1",
      academicYearId: "year-1",
      enrollmentPeriodId: "period-1",
      status: "DRAFT",
      isEditable: true,
      data: {},
      createdAt: "2026-03-01T12:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z",
    };

    render(<EnrollmentDetailView application={emptyApp} />);

    expect(screen.getByText("Sin documentos adjuntos")).toBeInTheDocument();
    expect(screen.getByText("No aplica / Postulante mayor de edad.")).toBeInTheDocument();
  });
});
