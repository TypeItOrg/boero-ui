import { toFormControlValue } from "@common/utils/form-value.util";
import {
  DescriptionField,
  FormField,
  FormSelect,
  NameField,
} from "@features/academic/components/academic-form-controls";
import { ACADEMIC_SPACE_TYPE } from "@features/academic/types/academic-space-type.types";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";

const ACTIVE_STATUS_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

export function NamedDescriptionFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const hasActiveState =
    initialValues.active !== undefined || initialValues.status !== undefined || Boolean(initialValues.id);
  const initialActive = typeof initialValues.active === "boolean" ? String(initialValues.active) : "true";

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={!hasActiveState} />
      {hasActiveState ? (
        <FormField label="Estado" name="active" error={fieldErrors?.active}>
          <FormSelect name="active" defaultValue={initialActive} options={ACTIVE_STATUS_OPTIONS} />
        </FormField>
      ) : null}
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function AcademicSpaceFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} />
      <FormField label="Tipo" name="type" error={fieldErrors?.type} required>
        <FormSelect
          name="type"
          defaultValue={toFormControlValue(initialValues.type ?? ACADEMIC_SPACE_TYPE[0])}
          options={ACADEMIC_SPACE_TYPE.map((type) => ({ value: type, label: academicSpaceTypeLabels[type] }))}
        />
      </FormField>
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}
