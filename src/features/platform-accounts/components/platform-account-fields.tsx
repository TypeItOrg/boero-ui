"use client";

import type { ReactElement } from "react";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";

export function PlatformAccountFields({
  errors,
  defaultValues,
  register,
  isEdit,
}: {
  errors: FieldErrors<{
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  defaultValues: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  register: UseFormRegister<{
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>;
  isEdit: boolean;
}): ReactElement {
  return (
    <FieldGroup className="mt-5 gap-4">
      <FieldGroup className="grid items-start gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="platform-account-name" required>
            Nombre
          </FieldLabel>
          <Input
            id="platform-account-name"
            defaultValue={defaultValues.name}
            maxLength={255}
            autoComplete="given-name"
            placeholder="María"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="platform-account-last-name" required>
            Apellido
          </FieldLabel>
          <Input
            id="platform-account-last-name"
            defaultValue={defaultValues.lastName}
            maxLength={255}
            autoComplete="family-name"
            placeholder="González"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </FieldGroup>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="platform-account-email" required>
          Correo electrónico
        </FieldLabel>
        <Input
          id="platform-account-email"
          defaultValue={defaultValues.email}
          type="email"
          maxLength={150}
          autoComplete="email"
          placeholder="administracion@boero.edu.ar"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldDescription>Se utilizará para iniciar sesión en la plataforma.</FieldDescription>
        <FieldError errors={[errors.email]} />
      </Field>

      <FieldGroup className="grid items-start gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="platform-account-password" required={!isEdit}>
            {isEdit ? "Nueva contraseña" : "Contraseña"}
          </FieldLabel>
          <Input
            id="platform-account-password"
            type="password"
            minLength={8}
            maxLength={255}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldDescription>
            {isEdit ? "Dejala vacía para conservar la contraseña actual." : "Debe tener al menos 8 caracteres y será definitiva por ahora."}
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="platform-account-confirm-password" required={!isEdit}>
            {isEdit ? "Confirmar nueva contraseña" : "Confirmar contraseña"}
          </FieldLabel>
          <Input
            id="platform-account-confirm-password"
            type="password"
            maxLength={255}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>
    </FieldGroup>
  );
}
