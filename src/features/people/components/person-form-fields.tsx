import * as React from "react";
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { KeyRoundIcon, ShieldCheckIcon, UserRoundIcon, type LucideIcon } from "lucide-react";

import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import type { Person } from "@features/people/types/person.types";
import type { PersonFormInput } from "@features/people/types/person-form-input.types";
import { formatBirthDateInput, getLatestAllowedBirthDate, parseBirthDateInput } from "@features/people/utils/person-birth-date.util";

type PersonFormFieldsProps = {
  errors: FieldErrors<PersonFormInput>;
  register: UseFormRegister<PersonFormInput>;
};

type PersonDetailsFieldsProps = PersonFormFieldsProps & {
  isEdit: boolean;
  person?: Person;
};

type PersonCreateFieldsProps = PersonFormFieldsProps & {
  control: Control<PersonFormInput>;
};

export function PersonDetailsFields({ errors, isEdit, person, register }: PersonDetailsFieldsProps): React.ReactElement {
  return (
    <PersonFormCard>
      <PersonFormSectionHeading icon={UserRoundIcon} title="Datos personales" description="Información principal del usuario institucional." />
      <FieldGroup className="mt-4 flex flex-row flex-wrap items-start gap-4 sm:mt-5">
        <Field data-invalid={!!errors.firstName} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-first-name" required>
              Nombre
            </FieldLabel>
          </FieldContent>
          <Input id="person-first-name" aria-invalid={!!errors.firstName} defaultValue={person?.firstName} {...register("firstName")} />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field data-invalid={!!errors.lastName} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-last-name" required>
              Apellido
            </FieldLabel>
          </FieldContent>
          <Input id="person-last-name" aria-invalid={!!errors.lastName} defaultValue={person?.lastName} {...register("lastName")} />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </FieldGroup>

      <FieldGroup className="mt-4 flex flex-row flex-wrap items-start gap-4">
        {isEdit ? (
          <Field data-disabled className="flex-[1_0_min(200px,100%)]">
            <FieldContent>
              <FieldLabel htmlFor="person-document">Documento</FieldLabel>
            </FieldContent>
            <Input id="person-document" value={person?.documentNumber} disabled />
          </Field>
        ) : null}

        <Field data-invalid={!!errors.email} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-email" required>
              Email
            </FieldLabel>
          </FieldContent>
          <Input id="person-email" type="email" aria-invalid={!!errors.email} defaultValue={person?.email ?? ""} {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-phone">Teléfono</FieldLabel>
          </FieldContent>
          <PhoneInput id="person-phone" aria-invalid={!!errors.phoneNumber} defaultValue={person?.phoneNumber ?? ""} {...register("phoneNumber")} />
          <FieldError errors={[errors.phoneNumber]} />
        </Field>
      </FieldGroup>
    </PersonFormCard>
  );
}

export function PersonPasswordFields({ errors, register }: PersonFormFieldsProps): React.ReactElement {
  return (
    <PersonFormCard>
      <PersonFormSectionHeading
        icon={KeyRoundIcon}
        title="Cambiar contraseña"
        description="Dejá los campos en blanco para conservar la contraseña actual."
      />
      <FieldGroup className="mt-4 flex flex-row flex-wrap items-start gap-4 sm:mt-5">
        <Field data-invalid={!!errors.password} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-password">Nueva contraseña</FieldLabel>
          </FieldContent>
          <PasswordInput id="person-password" aria-invalid={!!errors.password} {...register("password")} />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword} className="flex-[1_0_min(200px,100%)]">
          <FieldContent>
            <FieldLabel htmlFor="person-confirm-password">Confirmar nueva contraseña</FieldLabel>
          </FieldContent>
          <PasswordInput id="person-confirm-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>
    </PersonFormCard>
  );
}

export function PersonCreateFields({ control, errors, register }: PersonCreateFieldsProps): React.ReactElement {
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

function PersonFormSectionHeading({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }): React.ReactElement {
  return (
    <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
      <div className="flex items-center gap-3.5">
        <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </header>
  );
}

function PersonFormCard({ children }: React.PropsWithChildren): React.ReactElement {
  return <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">{children}</div>;
}
