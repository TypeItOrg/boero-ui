import type { ReactElement } from "react";

import { KeyRoundIcon, UserRoundIcon } from "lucide-react";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";
import { PhoneInput } from "@common/components/ui/restricted-input";

import { PersonFormCard, PersonFormSectionHeading } from "@features/people/components/person-form-card";
import { type PersonFormFieldsProps } from "@features/people/types/person-form-fields-props.types";
import type { Person } from "@features/people/types/person.types";

type PersonDetailsFieldsProps = PersonFormFieldsProps & {
  isEdit: boolean;
  person?: Person;
};

export function PersonDetailsFields({ errors, isEdit, person, register }: PersonDetailsFieldsProps): ReactElement {
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

export function PersonPasswordFields({ errors, register }: PersonFormFieldsProps): ReactElement {
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

export { PersonCreateFields } from "@features/people/components/person-create-fields";
