import { render, screen } from "@testing-library/react";

import { EnrollmentApplicationTableRow } from "@features/enrollment-applications/components/enrollment-application-table-row";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";

const INSTITUTION_ID = "00000000-0000-4000-8000-000000000001";
const APPLICATION_ID = "00000000-0000-4000-8000-000000000002";

function application(status: EnrollmentApplication["status"], rejectionReason?: string): EnrollmentApplication {
  return {
    applicationId: APPLICATION_ID,
    institutionId: INSTITUTION_ID,
    personId: "00000000-0000-4000-8000-000000000003",
    applicantFirstName: "Ana",
    applicantLastName: "Garcia",
    applicantDocumentNumber: "12345678",
    studyPlanId: "00000000-0000-4000-8000-000000000004",
    studyPlanName: "Plan Básico",
    academicYearId: "00000000-0000-4000-8000-000000000005",
    academicYear: 2027,
    enrollmentPeriodId: "00000000-0000-4000-8000-000000000006",
    status,
    rejectionReason,
    isEditable: false,
    createdAt: "2026-09-05T09:00:00",
    updatedAt: "2026-09-05T09:00:00",
  };
}

describe("EnrollmentApplicationTableRow", () => {
  it("shows the rejection reason for the staff when the application was rejected", () => {
    render(
      <table>
        <tbody>
          <EnrollmentApplicationTableRow
            application={application("REJECTED", "Documentación incompleta")}
            canApprove
            canReject
            onApprove={() => undefined}
            onReject={() => undefined}
          />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Documentación incompleta")).toBeInTheDocument();
    expect(screen.queryByText("Aprobar inscripción")).not.toBeInTheDocument();
  });

  it("does not render actions for a submitted application without permissions", () => {
    render(
      <table>
        <tbody>
          <EnrollmentApplicationTableRow
            application={application("SUBMITTED")}
            canApprove={false}
            canReject={false}
            onApprove={() => undefined}
            onReject={() => undefined}
          />
        </tbody>
      </table>,
    );

    expect(screen.queryByLabelText(/Abrir acciones/)).not.toBeInTheDocument();
  });
});
