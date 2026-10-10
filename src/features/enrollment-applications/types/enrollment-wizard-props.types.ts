import type { Shift } from "@features/academic/types/shift.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

export interface EnrollmentWizardProps {
  initialApplication: EnrollmentApplicationResponse;
  initialShifts?: readonly Shift[];
  initialCourseOptions?: readonly EnrollmentCourseOption[];
  initialCourseOptionsPage?: number;
  initialCourseOptionsTotalPages?: number;
  readOnly?: boolean;
  returnTo?: string;
}
