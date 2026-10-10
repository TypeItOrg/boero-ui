import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";

export type EnrollmentApplicationCourseDialogProps = {
  applicationId: string;
  institutionId?: string;
  scope?: AcademicScope;
  course: EnrollmentApplicationCourse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
};
