"use client";

import { useActionState, useState } from "react";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import Link from "next/link";
import { ActionForm } from "@common/components/action-form";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { InstitutionalAuthInstitutionField } from "@features/institutional-auth/components/institutional-auth-institution-field";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { Switch } from "@common/components/ui/switch";
import { NumericInput } from "@common/components/ui/restricted-input";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { registerInstitutional } from "@features/institutional-auth/actions/institutional-register.action";
import { type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";
import { formatBirthDateInput, getLatestAdultBirthDate, getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";

const INITIAL_STATE: InstitutionalRegisterActionState = {};

export function InstitutionalRegisterForm(): React.ReactElement {
  const [state, formAction, isPending] = useActionState<InstitutionalRegisterActionState, FormData>(registerInstitutional, INITIAL_STATE);
  const [institution, setInstitution] = useState<InstitutionalInstitution>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [isGuardian, setIsGuardian] = useState(false);

  function handleGuardianChange(checked: boolean): void {
    setIsGuardian(checked);

    // A guardian must be an adult: drop a birth date that no longer fits instead of submitting it.
    if (checked && birthDate && birthDate > getLatestAdultBirthDate()) {
      setBirthDate(undefined);
    }
  }

  return (
    <ActionForm action={formAction} className="flex flex-col justify-center p-5 sm:p-8">
      <InstitutionalAuthStepHeader
        title="Formá parte"
        description="Completá tus datos para registrarte en una institución."
        showInstitutionName={false}
      />

      <div className="mt-6 space-y-6">
        {state.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-6">
          <InstitutionalAuthInstitutionField
            id="institution-id"
            institution={institution}
            onChange={setInstitution}
            disabled={isPending}
            error={state.fieldErrors?.institutionId}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="register-name" required>
                Nombre
              </FieldLabel>
              <Input aria-invalid={!!state.fieldErrors?.name} autoComplete="given-name" id="register-name" name="name" />
              <FieldError errors={state.fieldErrors?.name ? [{ message: state.fieldErrors.name }] : undefined} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.lastName}>
              <FieldLabel htmlFor="register-last-name" required>
                Apellido
              </FieldLabel>
              <Input aria-invalid={!!state.fieldErrors?.lastName} autoComplete="family-name" id="register-last-name" name="lastName" />
              <FieldError errors={state.fieldErrors?.lastName ? [{ message: state.fieldErrors.lastName }] : undefined} />
            </Field>
          </div>
        </FieldGroup>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!state.fieldErrors?.documentNumber}>
            <FieldLabel htmlFor="register-document-number" required>
              Documento
            </FieldLabel>
            <NumericInput
              aria-invalid={!!state.fieldErrors?.documentNumber}
              autoComplete="username"
              id="register-document-number"
              maxLength={8}
              name="documentNumber"
            />
            <FieldError errors={state.fieldErrors?.documentNumber ? [{ message: state.fieldErrors.documentNumber }] : undefined} />
          </Field>

          <Field data-invalid={!!state.fieldErrors?.birthDate}>
            <FieldLabel htmlFor="register-birth-date" required>
              Fecha de nacimiento
            </FieldLabel>
            <input name="birthDate" type="hidden" value={formatBirthDateInput(birthDate)} />
            <DatePicker
              aria-invalid={!!state.fieldErrors?.birthDate}
              id="register-birth-date"
              maxDate={isGuardian ? getLatestAdultBirthDate() : getLatestAllowedBirthDate()}
              onChange={setBirthDate}
              value={birthDate}
            />
            <FieldError errors={state.fieldErrors?.birthDate ? [{ message: state.fieldErrors.birthDate }] : undefined} />
          </Field>
        </div>

        <Field data-invalid={!!state.fieldErrors?.email}>
          <FieldLabel htmlFor="register-email" required>
            Email
          </FieldLabel>
          <Input aria-invalid={!!state.fieldErrors?.email} autoComplete="email" id="register-email" name="email" type="email" />
          <FieldError errors={state.fieldErrors?.email ? [{ message: state.fieldErrors.email }] : undefined} />
        </Field>

        <Field data-invalid={!!state.fieldErrors?.isGuardian} orientation="horizontal">
          <input name="isGuardian" type="hidden" value={String(isGuardian)} />
          <Switch
            aria-describedby="register-is-guardian-help"
            checked={isGuardian}
            id="register-is-guardian"
            onCheckedChange={handleGuardianChange}
          />
          <div className="grid gap-1">
            <FieldLabel htmlFor="register-is-guardian">Soy tutor o representante legal a cargo de menores</FieldLabel>
            <p className="text-muted-foreground text-sm" id="register-is-guardian-help">
              Permite inscribir y gestionar las solicitudes de tus hijos o personas bajo tu tutela. Tenés que ser mayor de 18 años.
            </p>
          </div>
          <FieldError errors={state.fieldErrors?.isGuardian ? [{ message: state.fieldErrors.isGuardian }] : undefined} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!state.fieldErrors?.password}>
            <FieldLabel htmlFor="register-password" required>
              Contraseña
            </FieldLabel>
            <PasswordInput aria-invalid={!!state.fieldErrors?.password} autoComplete="new-password" id="register-password" name="password" />
            <FieldError errors={state.fieldErrors?.password ? [{ message: state.fieldErrors.password }] : undefined} />
          </Field>

          <Field data-invalid={!!state.fieldErrors?.confirmPassword}>
            <FieldLabel htmlFor="register-confirm-password" required>
              Repetir contraseña
            </FieldLabel>
            <PasswordInput
              aria-invalid={!!state.fieldErrors?.confirmPassword}
              autoComplete="new-password"
              id="register-confirm-password"
              name="confirmPassword"
            />
            <FieldError errors={state.fieldErrors?.confirmPassword ? [{ message: state.fieldErrors.confirmPassword }] : undefined} />
          </Field>
        </div>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
            <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPending && "opacity-0")}>Crear cuenta</span>
            {isPending ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                <Loader2Icon aria-hidden="true" className="animate-spin" />
                <span className="sr-only" role="status" aria-live="polite">
                  Registrando...
                </span>
              </span>
            ) : null}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            ¿Ya tenés una cuenta?{" "}
            <Link className="text-primary font-medium underline underline-offset-4" href="/auth/login">
              Iniciar sesión
            </Link>
          </p>
        </footer>
      </div>
    </ActionForm>
  );
}
