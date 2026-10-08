import type { ReactElement } from "react";

import { NumericInput } from "@common/components/ui/restricted-input";
import { toFormControlValue, toOptionalFormString } from "@common/utils/form-value.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { AcademicSpaceDropdown } from "@features/academic/components/academic-option-dropdown";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { REQUIREMENT_TYPE } from "@features/academic/types/requirement-type.types";
import { approvalModeLabels, requirementTypeLabels } from "@features/academic/utils/academic-labels.util";
import {
  ACADEMIC_SPACE_OPTION_PRESENTATION,
  getAcademicSpaceOptionDescription,
  getAcademicSpaceOptionGroup,
  getAcademicSpaceOptionLabel,
} from "@features/academic/utils/academic-space-option.util";

export function StudyPlanSpaceFields({
  academicSpaces = [],
  institutionId,
  levels = [],
  initialValues = {},
  fieldErrors,
  scope,
}: AcademicFieldsProps): ReactElement {
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
            groupOrder={ACADEMIC_SPACE_OPTION_PRESENTATION.groupOrder}
            options={academicSpaces.map((space) => ({
              value: space.id,
              label: getAcademicSpaceOptionLabel(space),
              displayLabel: space.name,
              description: getAcademicSpaceOptionDescription(space),
              group: getAcademicSpaceOptionGroup(space),
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
          options={REQUIREMENT_TYPE.map((type) => ({
            value: type,
            label: requirementTypeLabels[type],
          }))}
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
