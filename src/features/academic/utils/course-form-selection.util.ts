import { toOptionalFormString } from "@common/utils/form-value.util";

import type { CourseSpaceOption } from "@features/academic/services/course-options.service";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import type { CourseFormSelection } from "@features/academic/types/course-form-selection.types";
import { getAcademicSpaceOptionLabel } from "@features/academic/utils/academic-space-option.util";

export function createCourseFormSelection(initial: AcademicFieldsProps["initialValues"]): CourseFormSelection {
  const format = toOptionalFormString(initial?.academicSpaceFormat);

  return {
    studyPlanId: toOptionalFormString(initial?.studyPlanId),
    studyPlanSpaceId: toOptionalFormString(initial?.studyPlanSpaceId),
    academicSpaceId: toOptionalFormString(initial?.academicSpaceId),
    instrumentId: toOptionalFormString(initial?.instrumentId),
    instrumental: Boolean(initial?.academicSpaceInstrumental),
    format: format === "INDIVIDUAL" || format === "GRUPAL" ? format : undefined,
  };
}

export function changeCourseStudyPlan(selection: CourseFormSelection, studyPlanId: string | undefined): CourseFormSelection {
  return selection.studyPlanId === studyPlanId ? selection : { studyPlanId, instrumental: false };
}

export function changeCourseAcademicSpace(selection: CourseFormSelection, value: string | undefined, item?: CourseSpaceOption): CourseFormSelection {
  const instrumental = Boolean(item?.instrumental);
  const studyPlanSpaceId = item?.studyPlanSpaceId ?? value;

  return {
    ...selection,
    studyPlanSpaceId,
    academicSpaceId: item?.id,
    instrumentId: instrumental && selection.studyPlanSpaceId === studyPlanSpaceId ? selection.instrumentId : undefined,
    instrumental,
    spaceLabel: item ? getAcademicSpaceOptionLabel(item) : undefined,
    format: item?.format,
  };
}
