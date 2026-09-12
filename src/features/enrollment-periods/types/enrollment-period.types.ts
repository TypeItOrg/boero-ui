export type EnrollmentPeriodStatus = "PLANNED" | "OPEN" | "CLOSED";

export type EnrollmentPeriod = {
  id: string;
  institutionId: string;
  academicYearId: string;
  academicYearNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  status: EnrollmentPeriodStatus;
  deletedAt?: string | null;
};

export type CreateEnrollmentPeriodRequest = {
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type UpdateEnrollmentPeriodRequest = {
  name: string;
  startDate: string;
  endDate: string;
};

export type EnrollmentPeriodStatusRequest = {
  status: EnrollmentPeriodStatus;
};
