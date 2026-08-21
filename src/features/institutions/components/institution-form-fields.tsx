import * as React from "react";
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn } from "react-hook-form";

import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PhoneInput } from "@common/components/ui/restricted-input";
import { Switch } from "@common/components/ui/switch";
import { InstitutionLocationFields } from "@features/institutions/components/institution-location-fields";
import type { InstitutionFormInput } from "@features/institutions/schemas/institution-form.schema";

export { InstitutionLocationFields };

type InstitutionFormFieldsProps = {
  defaultValues: InstitutionFormInput;
  errors: FieldErrors<InstitutionFormInput>;
  register: UseFormRegister<InstitutionFormInput>;
};

type InstitutionGeneralFieldsProps = Omit<InstitutionFormFieldsProps, "register"> & {
  nameField: UseFormRegisterReturn<"name">;
  onNameChange: React.ChangeEventHandler<HTMLInputElement>;
  onSlugChange: React.ChangeEventHandler<HTMLInputElement>;
  slugField: UseFormRegisterReturn<"slug">;
};

export function InstitutionGeneralFields({
  defaultValues,
  errors,
  nameField,
  onNameChange,
  onSlugChange,
  slugField,
}: InstitutionGeneralFieldsProps): React.ReactElement {
  return (
    <InstitutionFormCard>
      <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
        <Field data-invalid={!!errors.name} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="institution-name" required>
              Nombre
            </FieldLabel>
          </FieldContent>
          <Input
            id="institution-name"
            defaultValue={defaultValues.name}
            maxLength={255}
            placeholder="Conservatorio Superior de Música"
            aria-invalid={!!errors.name}
            {...nameField}
            onChange={onNameChange}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.slug} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="institution-slug" required>
              Slug
            </FieldLabel>
          </FieldContent>
          <Input
            id="institution-slug"
            defaultValue={defaultValues.slug}
            maxLength={100}
            aria-invalid={!!errors.slug}
            {...slugField}
            onChange={onSlugChange}
          />
          <FieldError errors={[errors.slug]} />
        </Field>
      </FieldGroup>
    </InstitutionFormCard>
  );
}

export function InstitutionContactFields({ defaultValues, errors, register }: InstitutionFormFieldsProps): React.ReactElement {
  return (
    <InstitutionFormCard>
      <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
        <Field data-invalid={!!errors.phoneNumber} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="institution-phone">Teléfono</FieldLabel>
          </FieldContent>
          <PhoneInput
            id="institution-phone"
            defaultValue={defaultValues.phoneNumber}
            maxLength={30}
            placeholder="0353-4619146"
            aria-invalid={!!errors.phoneNumber}
            {...register("phoneNumber")}
          />
          <FieldError errors={[errors.phoneNumber]} />
        </Field>

        <Field data-invalid={!!errors.email} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="institution-email">Email</FieldLabel>
          </FieldContent>
          <Input
            id="institution-email"
            defaultValue={defaultValues.email}
            type="email"
            maxLength={150}
            placeholder="info@conservatorio.edu.ar"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </FieldGroup>
    </InstitutionFormCard>
  );
}

export function InstitutionStatusField({
  active,
  onActiveChange,
}: {
  active: boolean;
  onActiveChange: (active: boolean) => void;
}): React.ReactElement {
  return (
    <InstitutionFormCard>
      <FieldGroup>
        <Field orientation="horizontal" className="bg-background rounded-lg border p-4">
          <FieldContent>
            <FieldLabel htmlFor="institution-active">Institución activa</FieldLabel>
            <FieldDescription>Las instituciones inactivas no están disponibles para el acceso de usuarios.</FieldDescription>
          </FieldContent>
          <Switch id="institution-active" checked={active} onCheckedChange={onActiveChange} aria-label="Estado de la institución" />
        </Field>
      </FieldGroup>
    </InstitutionFormCard>
  );
}

function InstitutionFormCard({ children, className }: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return (
    <div className={className ? `bg-muted/25 rounded-xl border p-5 md:p-6 ${className}` : "bg-muted/25 rounded-xl border p-5 md:p-6"}>{children}</div>
  );
}
