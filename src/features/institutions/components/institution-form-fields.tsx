import * as React from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { Switch } from "@common/components/ui/switch";
import { Textarea } from "@common/components/ui/textarea";
import { LocationPicker } from "@features/locations/components/location-picker";
import type {
  InstitutionFormInput,
  InstitutionFormValues,
} from "@features/institutions/schemas/institution-form.schema";

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

type InstitutionLocationFieldsProps = InstitutionFormFieldsProps & {
  control: Control<InstitutionFormInput, unknown, InstitutionFormValues>;
  initialLocation: React.ComponentProps<typeof LocationPicker>["initialLocation"];
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

export function InstitutionLocationFields({
  control,
  defaultValues,
  errors,
  initialLocation,
  register,
}: InstitutionLocationFieldsProps): React.ReactElement {
  return (
    <InstitutionFormCard className="flex grow flex-col">
      <div className="flex grow flex-col gap-4">
        <Controller
          control={control}
          name="cityId"
          render={({ field, fieldState }) => (
            <LocationPicker
              error={fieldState.error?.message}
              initialLocation={initialLocation}
              onValueChange={field.onChange}
            />
          )}
        />

        <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
          <Field data-invalid={!!errors.street} className="flex-[1_0_min(250px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="institution-street">Calle</FieldLabel>
            </FieldContent>
            <Input
              id="institution-street"
              defaultValue={defaultValues.street}
              placeholder="Bv. España"
              aria-invalid={!!errors.street}
              {...register("street")}
            />
            <FieldError errors={[errors.street]} />
          </Field>

          <Field data-invalid={!!errors.number} className="flex-[1_0_min(120px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="institution-number">Altura</FieldLabel>
            </FieldContent>
            <NumericInput
              id="institution-number"
              defaultValue={defaultValues.number}
              maxLength={50}
              placeholder="1174"
              aria-invalid={!!errors.number}
              {...register("number")}
            />
            <FieldError errors={[errors.number]} />
          </Field>

          <Field className="flex-[1_0_min(180px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="institution-neighborhood">Barrio</FieldLabel>
            </FieldContent>
            <Input
              id="institution-neighborhood"
              defaultValue={defaultValues.neighborhood}
              placeholder="Centro"
              {...register("neighborhood")}
            />
          </Field>
        </FieldGroup>

        <Field className="flex w-full grow flex-col">
          <FieldContent className="grow-0">
            <FieldLabel htmlFor="institution-additional-info">Información adicional</FieldLabel>
          </FieldContent>
          <Textarea
            id="institution-additional-info"
            className="bg-background grow resize-none"
            defaultValue={defaultValues.additionalInfo}
            placeholder="Piso, oficina o indicaciones para llegar..."
            {...register("additionalInfo")}
          />
        </Field>
      </div>
    </InstitutionFormCard>
  );
}

export function InstitutionContactFields({
  defaultValues,
  errors,
  register,
}: InstitutionFormFieldsProps): React.ReactElement {
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
            <FieldDescription>
              Las instituciones inactivas no están disponibles para el acceso de usuarios.
            </FieldDescription>
          </FieldContent>
          <Switch
            id="institution-active"
            checked={active}
            onCheckedChange={onActiveChange}
            aria-label="Estado de la institución"
          />
        </Field>
      </FieldGroup>
    </InstitutionFormCard>
  );
}

function InstitutionFormCard({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>): React.ReactElement {
  return (
    <div
      className={
        className ? `bg-muted/25 rounded-xl border p-5 md:p-6 ${className}` : "bg-muted/25 rounded-xl border p-5 md:p-6"
      }
    >
      {children}
    </div>
  );
}
