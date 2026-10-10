import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export type EnrollmentPeriodFormProps = {
  initialInstitution?: { id: string; name: string };
  period?: EnrollmentPeriod;
  returnTo: string;
  scope: AcademicScope;
};
