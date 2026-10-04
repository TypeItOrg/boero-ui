"use client";

import { Badge } from "@common/components/ui/badge";
import { COURSE_ENROLLMENT_GRADE_STATUS_LABELS } from "@features/course-enrollments/constants/course-enrollment-grade.constants";
import type { CourseEnrollmentGradeStatus } from "@features/course-enrollments/types/course-enrollment-grade-status.types";

export function CourseEnrollmentGradeStatusBadge({ status }: { status: CourseEnrollmentGradeStatus }): React.ReactElement {
  if (status === "PUBLISHED") {
    return <Badge variant="success">{COURSE_ENROLLMENT_GRADE_STATUS_LABELS[status]}</Badge>;
  }

  if (status === "DRAFT") {
    return <Badge variant="secondary">{COURSE_ENROLLMENT_GRADE_STATUS_LABELS[status]}</Badge>;
  }

  if (status === "PENDING_DELETION") {
    return <Badge variant="destructive">{COURSE_ENROLLMENT_GRADE_STATUS_LABELS[status]}</Badge>;
  }

  return <Badge variant="outline">{COURSE_ENROLLMENT_GRADE_STATUS_LABELS[status]}</Badge>;
}
