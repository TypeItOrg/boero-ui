export interface StudentSummary {
  studentId: string;
  personId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  fileNumber: string | null;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED" | "WITHDRAWN" | "SUSPENDED";
  enrollmentDate: string;
}
