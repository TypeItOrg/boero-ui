import type { ReactElement } from "react";

import { toOptionalFormString } from "@common/utils/form-value.util";

import { DateRangeFields } from "@features/academic/components/academic-date-range-fields";
import { FormField, FormSelect, NameField } from "@features/academic/components/academic-form-controls";
import { TrainingPathDropdown } from "@features/academic/components/academic-option-dropdown";
import { STUDY_PLAN_STATUS_OPTIONS } from "@features/academic/constants/study-plan-status-options.constants";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";

export function StudyPlanFields({
  canChangeStatus = false,
  initialValues = {},
  fieldErrors,
  institutionId,
  scope,
  trainingPathLocked = false,
  trainingPaths = [],
}: AcademicFieldsProps): ReactElement {
  const initialTrainingPathId = toOptionalFormString(initialValues.trainingPathId);
  const initialStatus = toOptionalFormString(initialValues.status);

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} />
      {canChangeStatus && initialStatus ? (
        <FormField label="Estado" name="status" error={fieldErrors?.status} className="sm:col-span-2" required>
          <FormSelect name="status" defaultValue={initialStatus} options={STUDY_PLAN_STATUS_OPTIONS} />
        </FormField>
      ) : null}
      <FormField label="Trayecto formativo" name="trainingPathId" error={fieldErrors?.trainingPathId} className="sm:col-span-2" required>
        {institutionId && scope ? (
          <TrainingPathDropdown
            key={institutionId}
            ariaInvalid={Boolean(fieldErrors?.trainingPathId)}
            disabled={trainingPathLocked}
            institutionId={institutionId}
            initialValue={initialTrainingPathId}
            name="trainingPathId"
            scope={scope}
            selectedLabel={toOptionalFormString(initialValues.trainingPathName)}
          />
        ) : (
          <FormSelect
            disabled={Boolean(scope)}
            name="trainingPathId"
            defaultValue={initialTrainingPathId ?? ""}
            placeholder={scope ? "Seleccioná una institución primero" : "Seleccionar trayecto"}
            options={trainingPaths.map((path) => ({ value: path.id, label: path.name }))}
          />
        )}
      </FormField>
      <DateRangeFields
        startLabel="Vigente desde"
        startName="effectiveFrom"
        endLabel="Vigente hasta"
        endName="effectiveTo"
        initialValues={initialValues}
        fieldErrors={fieldErrors}
      />
    </>
  );
}
