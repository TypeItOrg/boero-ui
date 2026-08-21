import { NumericInput } from "@common/components/ui/restricted-input";
import { toFormControlValue, toOptionalFormString } from "@common/utils/form-value.util";
import { DateRangeFields } from "@features/academic/components/academic-date-range-fields";
import { DescriptionField, FormField, FormSelect, NameField } from "@features/academic/components/academic-form-controls";
import { AcademicSpaceDropdown, TrainingPathDropdown } from "@features/academic/components/academic-option-dropdown";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { REQUIRED_CONDITION } from "@features/academic/types/required-condition.types";
import { REQUIREMENT_STAGE } from "@features/academic/types/requirement-stage.types";
import { REQUIREMENT_TYPE } from "@features/academic/types/requirement-type.types";
import {
  academicSpaceTypeLabels,
  approvalModeLabels,
  requiredConditionLabels,
  requirementStageLabels,
  requirementTypeLabels,
} from "@features/academic/utils/academic-labels.util";

export function StudyPlanFields({
  initialValues = {},
  fieldErrors,
  institutionId,
  scope,
  trainingPathLocked = false,
  trainingPaths = [],
}: AcademicFieldsProps): React.ReactElement {
  const initialTrainingPathId = toOptionalFormString(initialValues.trainingPathId);
  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} />
      <FormField label="Trayecto formativo" name="trainingPathId" error={fieldErrors?.trainingPathId} className="sm:col-span-2" required>
        {institutionId && scope ? (
          <TrainingPathDropdown
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
            name="trainingPathId"
            defaultValue={initialTrainingPathId ?? ""}
            placeholder="Seleccionar trayecto"
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

export function AcademicLevelFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={false} />
      <FormField label="Orden" name="displayOrder" error={fieldErrors?.displayOrder} className="w-full flex-none sm:max-w-48" required>
        <NumericInput
          aria-invalid={Boolean(fieldErrors?.displayOrder)}
          defaultValue={toFormControlValue(initialValues.displayOrder ?? 1)}
          id="displayOrder"
          name="displayOrder"
          required
        />
      </FormField>
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function StudyPlanSpaceFields({
  academicSpaces = [],
  institutionId,
  levels = [],
  initialValues = {},
  fieldErrors,
  scope,
}: AcademicFieldsProps): React.ReactElement {
  const initialAcademicSpaceId = toOptionalFormString(initialValues.academicSpaceId);
  return (
    <>
      <FormField label="Espacio académico" name="academicSpaceId" error={fieldErrors?.academicSpaceId} className="sm:col-span-2" required>
        {institutionId && scope ? (
          <AcademicSpaceDropdown
            ariaInvalid={Boolean(fieldErrors?.academicSpaceId)}
            institutionId={institutionId}
            initialValue={initialAcademicSpaceId}
            name="academicSpaceId"
            scope={scope}
            selectedLabel={toOptionalFormString(initialValues.academicSpaceName)}
          />
        ) : (
          <FormSelect
            name="academicSpaceId"
            defaultValue={initialAcademicSpaceId ?? ""}
            placeholder="Seleccionar espacio"
            options={academicSpaces.map((space) => ({
              value: space.id,
              label: `${space.name} · ${academicSpaceTypeLabels[space.type]}`,
            }))}
          />
        )}
      </FormField>
      <FormField label="Nivel" name="academicLevelId" error={fieldErrors?.academicLevelId}>
        <FormSelect
          name="academicLevelId"
          defaultValue={toFormControlValue(initialValues.academicLevelId) || "unassigned"}
          options={[{ value: "unassigned", label: "Sin nivel" }, ...levels.map((level) => ({ value: level.id, label: level.name }))]}
        />
      </FormField>
      <FormField label="Orden" name="displayOrder" error={fieldErrors?.displayOrder} required>
        <NumericInput
          aria-invalid={Boolean(fieldErrors?.displayOrder)}
          defaultValue={toFormControlValue(initialValues.displayOrder ?? 1)}
          id="displayOrder"
          name="displayOrder"
          required
        />
      </FormField>
      <FormField label="Carácter" name="requirementType" error={fieldErrors?.requirementType} required>
        <FormSelect
          name="requirementType"
          defaultValue={toFormControlValue(initialValues.requirementType ?? REQUIREMENT_TYPE[0])}
          options={REQUIREMENT_TYPE.map((type) => ({ value: type, label: requirementTypeLabels[type] }))}
        />
      </FormField>
      <FormField label="Aprobación" name="approvalMode" error={fieldErrors?.approvalMode} required>
        <FormSelect
          name="approvalMode"
          defaultValue={toFormControlValue(initialValues.approvalMode ?? APPROVAL_MODE[0])}
          options={APPROVAL_MODE.map((mode) => ({ value: mode, label: approvalModeLabels[mode] }))}
        />
      </FormField>
    </>
  );
}

export function PrerequisiteFields({
  excludedPlanSpaceId,
  initialValues = {},
  fieldErrors,
  planSpaces = [],
}: AcademicFieldsProps): React.ReactElement {
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
          options={REQUIREMENT_STAGE.map((stage) => ({ value: stage, label: requirementStageLabels[stage] }))}
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
