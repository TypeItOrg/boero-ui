import type { ReactElement } from "react";

import { toFormControlValue } from "@common/utils/form-value.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { REQUIRED_CONDITION } from "@features/academic/types/required-condition.types";
import { REQUIREMENT_STAGE } from "@features/academic/types/requirement-stage.types";
import { requiredConditionLabels, requirementStageLabels } from "@features/academic/utils/academic-labels.util";

export function PrerequisiteFields({ excludedPlanSpaceId, initialValues = {}, fieldErrors, planSpaces = [] }: AcademicFieldsProps): ReactElement {
  const options = planSpaces
    .filter((space) => space.id !== excludedPlanSpaceId)
    .map((space) => ({
      value: space.id,
      label: [space.academicLevelName, space.academicSpaceName].filter(Boolean).join(" · "),
    }));

  const hasAvailableSpaces = options.length > 0;

  return (
    <>
      <FormField
        label="Espacio requerido"
        name="requiredStudyPlanSpaceId"
        error={fieldErrors?.requiredStudyPlanSpaceId}
        className="sm:col-span-2"
        required
      >
        <FormSelect
          name="requiredStudyPlanSpaceId"
          defaultValue={toFormControlValue(initialValues.requiredStudyPlanSpaceId)}
          disabled={!hasAvailableSpaces}
          placeholder={hasAvailableSpaces ? "Seleccionar espacio" : "No hay otros espacios disponibles"}
          options={options}
        />
      </FormField>
      <FormField label="Momento" name="requirementStage" error={fieldErrors?.requirementStage} required>
        <FormSelect
          name="requirementStage"
          defaultValue={toFormControlValue(initialValues.requirementStage ?? REQUIREMENT_STAGE[0])}
          options={REQUIREMENT_STAGE.map((stage) => ({
            value: stage,
            label: requirementStageLabels[stage],
          }))}
        />
      </FormField>
      <FormField label="Condición" name="requiredCondition" error={fieldErrors?.requiredCondition} required>
        <FormSelect
          name="requiredCondition"
          defaultValue={toFormControlValue(initialValues.requiredCondition ?? REQUIRED_CONDITION[1])}
          options={REQUIRED_CONDITION.map((condition) => ({
            value: condition,
            label: requiredConditionLabels[condition],
          }))}
        />
      </FormField>
    </>
  );
}
