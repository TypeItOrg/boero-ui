import type { ReactElement } from "react";

import { ShieldCheckIcon } from "lucide-react";
import { Controller, type Control } from "react-hook-form";

import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { NumericInput } from "@common/components/ui/restricted-input";

import { PersonFormCard, PersonFormSectionHeading } from "@features/people/components/person-form-card";
import { type PersonFormFieldsProps } from "@features/people/types/person-form-fields-props.types";
import type { PersonFormInput } from "@features/people/types/person-form-input.types";
import { formatBirthDateInput, getLatestAllowedBirthDate, parseBirthDateInput } from "@features/people/utils/person-birth-date.util";

export function PersonCreateFields({ control, errors, register }: PersonCreateFieldsProps): ReactElement {
  return (
    <PersonFormCard>
      <PersonFormSectionHeading icon={ShieldCheckIcon} title="Cuenta de acceso" description="Credenciales iniciales para iniciar sesión." />
      <FieldGroup className="mt-4 flex flex-row flex-wrap items-start gap-4 sm:mt-5">
        <Field data-invalid={!!errors.documentNumber} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-document" required>
              Documento
            </FieldLabel>
          </FieldContent>
          <NumericInput id="person-document" aria-invalid={!!errors.documentNumber} {...register("documentNumber")} />
          <FieldError errors={[errors.documentNumber]} />
        </Field>

        <Field data-invalid={!!errors.birthDate} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-birth-date" required>
              Fecha de nacimiento
            </FieldLabel>
          </FieldContent>
          <Controller
            control={control}
            name="birthDate"
            render={({ field, fieldState }) => (
              <DatePicker
                id="person-birth-date"
                value={parseBirthDateInput(field.value)}
                maxDate={getLatestAllowedBirthDate()}
                onChange={(date) => field.onChange(formatBirthDateInput(date))}
                aria-invalid={fieldState.invalid}
              />
            )}
          />
          <FieldError errors={[errors.birthDate]} />
        </Field>

        <Field data-invalid={!!errors.password} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-password" required>
              Contraseña inicial
            </FieldLabel>
          </FieldContent>
          <PasswordInput id="person-password" aria-invalid={!!errors.password} {...register("password")} />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-confirm-password" required>
              Confirmar contraseña
            </FieldLabel>
          </FieldContent>
          <PasswordInput id="person-confirm-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>
    </PersonFormCard>
  );
}

export type PersonCreateFieldsProps = PersonFormFieldsProps & {
  control: Control<PersonFormInput>;
};
