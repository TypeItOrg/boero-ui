import * as React from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput } from "@common/components/ui/restricted-input";
import { Textarea } from "@common/components/ui/textarea";
import { LocationPicker } from "@features/locations/components/location-picker";
import type { InstitutionFormInput, InstitutionFormValues } from "@features/institutions/schemas/institution-form.schema";

type InstitutionLocationFieldsProps = {
  control: Control<InstitutionFormInput, unknown, InstitutionFormValues>;
  defaultValues: InstitutionFormInput;
  errors: FieldErrors<InstitutionFormInput>;
  initialLocation: React.ComponentProps<typeof LocationPicker>["initialLocation"];
  register: UseFormRegister<InstitutionFormInput>;
};

export function InstitutionLocationFields({
  control,
  defaultValues,
  errors,
  initialLocation,
  register,
}: InstitutionLocationFieldsProps): React.ReactElement {
  return (
    <div className="bg-muted/25 flex grow flex-col rounded-xl border p-5 md:p-6">
      <div className="flex grow flex-col gap-4">
        <Controller
          control={control}
          name="cityId"
          render={({ field, fieldState }) => (
            <LocationPicker error={fieldState.error?.message} initialLocation={initialLocation} onValueChange={field.onChange} />
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
            <Input id="institution-neighborhood" defaultValue={defaultValues.neighborhood} placeholder="Centro" {...register("neighborhood")} />
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
    </div>
  );
}
