import type { CourseEnrollmentAssignmentOptions } from "@features/course-enrollments/types/course-enrollment-assignment-options.types";

export function hasEnrollmentCapacity(options: CourseEnrollmentAssignmentOptions): boolean {
  return options.classes.some((courseClass) =>
    courseClass.days.some(
      (day) =>
        day.availableCapacity !== 0 &&
        day.schedules.some((schedule) => options.format === "GRUPAL" || schedule.individualSlots.some((slot) => slot.available)),
    ),
  );
}
