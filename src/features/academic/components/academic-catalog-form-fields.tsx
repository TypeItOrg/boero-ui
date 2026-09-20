"use client";

import { useState } from "react";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { toFormControlValue } from "@common/utils/form-value.util";
import { DescriptionField, FormField, FormSelect, NameField } from "@features/academic/components/academic-form-controls";
import { ACADEMIC_SPACE_FORMAT } from "@features/academic/types/academic-space-format.types";
import { ACADEMIC_SPACE_TYPE } from "@features/academic/types/academic-space-type.types";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";

const ACTIVE_STATUS_OPTIONS = [
  { value: "true", label: "Activo" },
  { value: "false", label: "Inactivo" },
];

type ActiveStatusFieldProps = {
  error?: string;
  initialActive: string;
};

export function TrainingPathFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const hasActiveState = initialValues.active !== undefined || initialValues.status !== undefined || Boolean(initialValues.id);
  const initialActive = typeof initialValues.active === "boolean" ? String(initialValues.active) : "true";

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={!hasActiveState} />
      {hasActiveState ? <ActiveStatusField error={fieldErrors?.active} initialActive={initialActive} /> : null}
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function InstrumentFields({ canChangeStatus = true, initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const hasActiveState = Boolean(initialValues.id) && canChangeStatus;
  const initialActive = typeof initialValues.active === "boolean" ? String(initialValues.active) : "true";

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={!hasActiveState} />
      {hasActiveState ? <ActiveStatusField error={fieldErrors?.active} initialActive={initialActive} /> : null}
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function ShiftFields({ canChangeStatus = true, initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const hasActiveState = Boolean(initialValues.id) && canChangeStatus;
  const initialActive = typeof initialValues.active === "boolean" ? String(initialValues.active) : "true";

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={!hasActiveState} />
      {hasActiveState ? <ActiveStatusField error={fieldErrors?.active} initialActive={initialActive} /> : null}
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function AcademicSpaceFields({ canChangeStatus = true, initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const hasActiveState = Boolean(initialValues.id) && canChangeStatus;
  const initialActive = typeof initialValues.active === "boolean" ? String(initialValues.active) : "true";
  const instrumentalLocked = Boolean(initialValues.id && initialValues.instrumentalLocked);
  const [instrumental, setInstrumental] = useState(initialValues.instrumental === true);

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={!hasActiveState} />
      <FormField label="Tipo" name="type" error={fieldErrors?.type} required>
        <FormSelect
          name="type"
          defaultValue={toFormControlValue(initialValues.type ?? ACADEMIC_SPACE_TYPE[0])}
          options={ACADEMIC_SPACE_TYPE.map((type) => ({ value: type, label: academicSpaceTypeLabels[type] }))}
        />
      </FormField>
      <FormField label="Formato" name="format" error={fieldErrors?.format} required>
        <FormSelect
          name="format"
          defaultValue={toFormControlValue(initialValues.format ?? ACADEMIC_SPACE_FORMAT[0])}
          options={ACADEMIC_SPACE_FORMAT.map((format) => ({ value: format, label: academicSpaceFormatLabels[format] }))}
        />
      </FormField>
      <Field
        orientation="horizontal"
        data-disabled={instrumentalLocked}
        data-invalid={Boolean(fieldErrors?.instrumental)}
        className="flex-[1_0_min(350px,100%)] flex-wrap self-end pb-2"
      >
        <input type="hidden" name="instrumental" value={String(instrumental)} />
        <Checkbox
          id="instrumental"
          checked={instrumental}
          onCheckedChange={(checked) => setInstrumental(checked === true)}
          disabled={instrumentalLocked}
        />
        <FieldLabel htmlFor="instrumental" className="font-normal">
          Espacio instrumental
        </FieldLabel>
        <FieldError className="basis-full" errors={fieldErrors?.instrumental ? [{ message: fieldErrors.instrumental }] : undefined} />
        {instrumentalLocked ? (
          <p className="text-muted-foreground basis-full text-xs">No se puede modificar porque el espacio ya tiene cursos asociados.</p>
        ) : null}
      </Field>
      {hasActiveState ? <ActiveStatusField error={fieldErrors?.active} initialActive={initialActive} /> : null}
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

function ActiveStatusField({ error, initialActive }: ActiveStatusFieldProps): React.ReactElement {
  return (
    <>
      <input type="hidden" name="initialActive" value={initialActive} />
      <FormField label="Estado" name="active" error={error}>
        <FormSelect name="active" defaultValue={initialActive} options={ACTIVE_STATUS_OPTIONS} />
      </FormField>
    </>
  );
}
