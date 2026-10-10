import type { ReactElement } from "react";

import { CourseClassesSummary } from "@features/academic/components/course-classes-summary";
import { CourseInformationSummary } from "@features/academic/components/course-information-summary";
import type { Course } from "@features/academic/types/course.types";

export function CourseSummary({ course }: { course: Course }): ReactElement {
  return (
    <>
      <CourseInformationSummary course={course} />

      <CourseClassesSummary course={course} />
    </>
  );
}
