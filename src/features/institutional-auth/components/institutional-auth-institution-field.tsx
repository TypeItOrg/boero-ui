"use client";

import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { InstitutionPicker, type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { useInstitutionalBrand } from "@features/institutional-auth/components/institutional-brand-context";

export function InstitutionalAuthInstitutionField({
  id,
  institution,
  onChange,
  disabled,
  error,
}: {
  id: string;
  institution?: Pick<InstitutionalInstitution, "id" | "name">;
  onChange: (institution: InstitutionalInstitution | undefined) => void;
  disabled?: boolean;
  error?: string;
}): React.ReactElement {
  const fixedInstitution = useInstitutionalBrand();
  if (fixedInstitution) {
    return (
      <>
        <input name="institutionId" type="hidden" value={fixedInstitution.id} />
        <input name="institutionName" type="hidden" value={fixedInstitution.name} />
        <FieldError>{error}</FieldError>
      </>
    );
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id} required>
        Institución
      </FieldLabel>
      <input name="institutionName" type="hidden" value={institution?.name ?? ""} />
      <InstitutionPicker
        ariaInvalid={Boolean(error)}
        disabled={disabled}
        id={id}
        onValueChange={(_, item) => onChange(item)}
        selectedLabel={institution?.name}
        value={institution?.id}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
