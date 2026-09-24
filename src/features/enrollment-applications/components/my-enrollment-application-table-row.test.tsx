import { render, screen } from "@testing-library/react";

import { MyEnrollmentApplicationTableRow } from "@features/enrollment-applications/components/my-enrollment-application-table-row";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

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

describe("MyEnrollmentApplicationTableRow", () => {
  it("shows the rejection reason when the application was rejected", () => {
    render(
      <table>
        <tbody>
          <MyEnrollmentApplicationTableRow application={application("REJECTED", "Documentación incompleta")} />
        </tbody>
      </table>,
    );

    expect(screen.getByText("Documentación incompleta")).toBeInTheDocument();
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
  });

  it("shows a placeholder when the application was approved", () => {
    render(
      <table>
        <tbody>
          <MyEnrollmentApplicationTableRow application={application("APPROVED")} />
        </tbody>
      </table>,
    );

    expect(screen.queryByText("Documentación incompleta")).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  describe("applicant column", () => {
    function renderRow(app: EnrollmentApplication, currentPersonId?: string): void {
      render(
        <table>
          <tbody>
            <MyEnrollmentApplicationTableRow application={app} currentPersonId={currentPersonId} showApplicant />
          </tbody>
        </table>,
      );
    }

    it("shows the applicant and that you submitted it", () => {
      renderRow({ ...application("DRAFT"), submittedByPersonId: "guardian-1" }, "guardian-1");

      expect(screen.getByText("Ana Garcia")).toBeInTheDocument();
      expect(screen.getByText("Presentada por vos")).toBeInTheDocument();
    });

    it("flags applications submitted by another guardian", () => {
      renderRow({ ...application("DRAFT"), submittedByPersonId: "guardian-2" }, "guardian-1");

      expect(screen.getByText("Presentada por otro tutor")).toBeInTheDocument();
    });

    it("adds no submitter note to your own applications", () => {
      renderRow({ ...application("DRAFT"), submittedByPersonId: "00000000-0000-4000-8000-000000000003" }, "00000000-0000-4000-8000-000000000003");

      expect(screen.queryByText(/Presentada por/)).not.toBeInTheDocument();
    });
  });
});
