"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Resolver, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { createPersonAction } from "../actions/create-person.action";
import { updatePersonAction } from "../actions/update-person.action";
import { createPersonFormSchema, updatePersonFormSchema } from "../schemas/person-form.schema";
import type { Person } from "../types/person.types";
import type { SystemRoleCode } from "../types/person-role.types";
import type { PersonActionState, PersonFormFieldName } from "../types/person-action-state.types";

type PersonFormInput = {
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  password: string;
};

type CreateMode = {
  mode: "create";
  institutionId: string;
  person?: never;
  roleCodes?: never;
  formId?: string;
  hideActions?: boolean;
};

type EditMode = {
  mode: "edit";
  institutionId: string;
  person: Person;
  roleCodes?: readonly SystemRoleCode[];
  formId?: string;
  hideActions?: boolean;
};

type PersonFormProps = CreateMode | EditMode;

const EMPTY_FORM_VALUES: PersonFormInput = {
  firstName: "",
  lastName: "",
  documentNumber: "",
  email: "",
  phoneNumber: "",
  birthDate: "",
  password: "",
};

export function PersonForm({
  mode,
  institutionId,
  person,
  roleCodes,
  formId,
  hideActions = false,
}: PersonFormProps): React.ReactElement {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const listPath = `/platform/institutions/${institutionId}/people`;
  const resolver = getPersonFormResolver(isEdit);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<PersonFormInput>({
    resolver,
    defaultValues: getDefaultValues(person),
  });

  function onSubmit(values: PersonFormInput): void {
    setFormError(undefined);

    startTransition(async () => {
      const formData = getFormData(values, isEdit, roleCodes);
      const result = isEdit
        ? await updatePersonAction(institutionId, person.personId, formData)
        : await createPersonAction(institutionId, formData);

      const hasFieldErrors = setActionFieldErrors(result, setError);
      setFormError(hasFieldErrors ? undefined : result.error);

      if (result.success) {
        router.push(listPath);
      }
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{getErrorTitle(isEdit)}</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <FormCard>
          <SectionHeading title="Datos personales" description="Información principal del usuario institucional." />
          <FieldGroup className="mt-5 flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!errors.firstName} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="person-first-name" required>
                  Nombre
                </FieldLabel>
              </FieldContent>
              <Input id="person-first-name" aria-invalid={!!errors.firstName} {...register("firstName")} />
              <FieldError errors={[errors.firstName]} />
            </Field>

            <Field data-invalid={!!errors.lastName} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="person-last-name" required>
                  Apellido
                </FieldLabel>
              </FieldContent>
              <Input id="person-last-name" aria-invalid={!!errors.lastName} {...register("lastName")} />
              <FieldError errors={[errors.lastName]} />
            </Field>
          </FieldGroup>

          <FieldGroup className="mt-5 flex flex-row flex-wrap items-start gap-4">
            {isEdit && (
              <Field data-disabled className="flex-[1_0_min(200px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="person-document">Documento</FieldLabel>
                </FieldContent>
                <Input id="person-document" value={person.documentNumber} disabled />
              </Field>
            )}

            <Field data-invalid={!!errors.email} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="person-email">Email</FieldLabel>
              </FieldContent>
              <Input id="person-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="person-phone">Teléfono</FieldLabel>
              </FieldContent>
              <Input id="person-phone" {...register("phoneNumber")} />
            </Field>
          </FieldGroup>
        </FormCard>

        {!isEdit && (
          <FormCard>
            <SectionHeading title="Cuenta de acceso" description="Credenciales iniciales para iniciar sesión." />
            <FieldGroup className="mt-5 flex flex-row flex-wrap items-start gap-4">
              <Field data-invalid={!!errors.documentNumber} className="flex-[1_0_min(200px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="person-document" required>
                    Documento
                  </FieldLabel>
                </FieldContent>
                <Input
                  id="person-document"
                  inputMode="numeric"
                  aria-invalid={!!errors.documentNumber}
                  {...register("documentNumber")}
                />
                <FieldError errors={[errors.documentNumber]} />
              </Field>

              <Field data-invalid={!!errors.birthDate} className="flex-[1_0_min(200px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="person-birth-date">Fecha de nacimiento</FieldLabel>
                </FieldContent>
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field, fieldState }) => (
                    <DatePicker
                      id="person-birth-date"
                      value={parseDateInputValue(field.value)}
                      onChange={(date) => field.onChange(formatDateInputValue(date))}
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                />
                <FieldError errors={[errors.birthDate]} />
              </Field>

              <Field data-invalid={!!errors.password} className="basis-full">
                <FieldContent>
                  <FieldLabel htmlFor="person-password" required>
                    Contraseña inicial
                  </FieldLabel>
                </FieldContent>
                <PasswordInput id="person-password" aria-invalid={!!errors.password} {...register("password")} />
                <FieldError errors={[errors.password]} />
              </Field>
            </FieldGroup>
          </FormCard>
        )}
      </div>

      {!hideActions && (
        <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
          <Button
            asChild
            type="button"
            variant="outline"
            size="lg"
            className="flex-[1_0_min(140px,100%)] sm:flex-none"
            disabled={isPending}
          >
            <NavigationLink href={listPath}>Cancelar</NavigationLink>
          </Button>
          <Button type="submit" size="lg" className="flex-[1_0_min(140px,100%)] sm:flex-none" disabled={isPending}>
            {getSubmitLabel({ isEdit, isPending })}
          </Button>
        </div>
      )}
    </form>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }): React.ReactElement {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}

function FormCard({ children, className }: { children: React.ReactNode; className?: string }): React.ReactElement {
  return <div className={cn("bg-muted/25 rounded-xl border p-5 md:p-6", className)}>{children}</div>;
}

function getPersonFormResolver(isEdit: boolean): Resolver<PersonFormInput> {
  const schema = isEdit ? updatePersonFormSchema : createPersonFormSchema;

  return zodResolver(schema) as unknown as Resolver<PersonFormInput>;
}

function getDefaultValues(person: Person | undefined): PersonFormInput {
  if (!person) return { ...EMPTY_FORM_VALUES };

  return {
    firstName: person.firstName,
    lastName: person.lastName,
    documentNumber: person.documentNumber,
    email: person.email ?? "",
    phoneNumber: person.phoneNumber ?? "",
    birthDate: person.birthDate ?? "",
    password: "",
  };
}

function parseDateInputValue(value: string): Date | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return undefined;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;

  return date;
}

function formatDateInputValue(date: Date | undefined): string {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFormData(values: PersonFormInput, isEdit: boolean, roleCodes?: readonly SystemRoleCode[]): FormData {
  const formData = new FormData();
  const keys: Array<keyof PersonFormInput> = isEdit
    ? ["firstName", "lastName", "email", "phoneNumber"]
    : ["firstName", "lastName", "documentNumber", "email", "phoneNumber", "birthDate", "password"];

  for (const key of keys) {
    formData.append(key, values[key]);
  }

  if (isEdit && roleCodes) {
    formData.append("roleCodes", JSON.stringify(roleCodes));
  }

  return formData;
}

function setActionFieldErrors(result: PersonActionState, setError: UseFormSetError<PersonFormInput>): boolean {
  if (!result.fieldErrors) return false;

  let hasFieldErrors = false;

  for (const [field, message] of Object.entries(result.fieldErrors)) {
    if (message) {
      setError(field as PersonFormFieldName, { message });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}

function getErrorTitle(isEdit: boolean): string {
  return isEdit ? "No se pudo actualizar el usuario" : "No se pudo crear el usuario";
}

function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return "Guardando...";
  if (isEdit) return "Guardar cambios";

  return "Crear usuario";
}
