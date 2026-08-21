"use client";

import type { ComponentType } from "react";

import { AcademicSpaceFields, InstrumentFields, TrainingPathFields } from "@features/academic/components/academic-catalog-form-fields";
import { AcademicYearFields } from "@features/academic/components/academic-year-form-fields";
import { AcademicLevelFields, PrerequisiteFields, StudyPlanFields, StudyPlanSpaceFields } from "@features/academic/components/study-plan-form-fields";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

type AcademicFormFieldsProps = AcademicFieldsProps & {
  resource: AcademicResource;
};

const FIELD_COMPONENTS: Record<AcademicResource, ComponentType<AcademicFieldsProps>> = {
  [AcademicResource.ACADEMIC_YEAR]: AcademicYearFields,
  [AcademicResource.TRAINING_PATH]: TrainingPathFields,
  [AcademicResource.STUDY_PLAN]: StudyPlanFields,
  [AcademicResource.ACADEMIC_LEVEL]: AcademicLevelFields,
  [AcademicResource.ACADEMIC_SPACE]: AcademicSpaceFields,
  [AcademicResource.STUDY_PLAN_SPACE]: StudyPlanSpaceFields,
  [AcademicResource.PREREQUISITE]: PrerequisiteFields,
  [AcademicResource.INSTRUMENT]: InstrumentFields,
};

export function AcademicFormFields({ resource, ...props }: AcademicFormFieldsProps): React.ReactElement {
  const FieldsComponent = FIELD_COMPONENTS[resource];
  return <FieldsComponent {...props} />;
}
