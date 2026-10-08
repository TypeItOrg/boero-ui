import { format, isValid } from "date-fns";

import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentHealthInclusion } from "@features/enrollment-applications/types/enrollment-health-inclusion.types";
import type { EnrollmentPreference } from "@features/enrollment-applications/types/enrollment-preference.types";
import type { EnrollmentResponsible } from "@features/enrollment-applications/types/enrollment-responsible.types";
import type { SchoolingFormState } from "@features/enrollment-applications/types/enrollment-schooling-state.types";
import { parseInitialBirthDate } from "@features/enrollment-applications/utils/enrollment-birth-date.util";

export function buildEnrollmentWizardData({
  initial,
  schooling,
  healthInclusion,
  responsible,
  preference,
  selectedCourseIds,
}: {
  initial: EnrollmentApplicationData | undefined;
  schooling: SchoolingFormState;
  healthInclusion: EnrollmentHealthInclusion;
  responsible: EnrollmentResponsible;
  preference: EnrollmentPreference;
  selectedCourseIds: string[];
}): EnrollmentApplicationData {
  const birthDate = parseInitialBirthDate(initial?.personalData?.birthDate);

  const trainingPathId = initial?.careerSelection?.trainingPathId;

  return {
    personalData: {
      firstName: initial?.personalData?.firstName ?? "",
      lastName: initial?.personalData?.lastName ?? "",
      documentNumber: initial?.personalData?.documentNumber ?? "",
      birthDate: birthDate && isValid(birthDate) ? format(birthDate, "yyyy-MM-dd") : null,
      phoneNumber: initial?.personalData?.phoneNumber ?? "",
      email: initial?.personalData?.email ?? "",
    },
    academicBackground: {
      ...schooling,
      schoolOrigin: schooling.schoolOrigin || null,
      currentGradeYear: schooling.currentGradeYear || null,
      levelCompleted:
        schooling.currentlyStudying === false && schooling.educationLevel === "SECONDARY" ? schooling.secondaryCompleted : schooling.levelCompleted,
      secondaryDegreeTitle: schooling.secondaryDegreeTitle || null,
    },
    healthInclusion,
    responsible,
    careerSelection: trainingPathId ? { trainingPathId } : undefined,
    courses: selectedCourseIds.map((courseId) => ({
      courseId,
      preferredTeacherId: initial?.courses?.find((course) => course.courseId === courseId)?.preferredTeacherId ?? null,
    })),
    preference,
  };
}
