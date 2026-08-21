"use client";

import { SyntheticEvent, useActionState, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput } from "@common/components/ui/restricted-input";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { registerInstitutional } from "@features/institutional-auth/actions/institutional-register.action";
import { InstitutionPicker, type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";
import { formatBirthDateInput, getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";

const INITIAL_STATE: InstitutionalRegisterActionState = {};

export function InstitutionalRegisterForm(): React.ReactElement {
  const [state, formAction] = useActionState<InstitutionalRegisterActionState, FormData>(registerInstitutional, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();
  const [institution, setInstitution] = useState<InstitutionalInstitution>();
  const [birthDate, setBirthDate] = useState<Date>();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <header className="flex flex-col items-center space-y-1 text-center">
        <Image width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-20 md:hidden" />
        <h1 className="text-2xl font-bold">Formá parte</h1>
        <p className="text-muted-foreground text-sm">
          <span className="hidden md:block">Completá tus datos para registrarte en una institución.</span>
          <span className="md:hidden">Completá tus datos para registrarte en una institución.</span>
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {state.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={!!state.fieldErrors?.institutionId}>
            <FieldLabel htmlFor="register-institution-id" required>
              Institución
            </FieldLabel>
            <InstitutionPicker
              ariaInvalid={!!state.fieldErrors?.institutionId}
              id="register-institution-id"
              onValueChange={(_, item) => setInstitution(item)}
              selectedLabel={institution?.name}
              value={institution?.id}
            />
            <FieldError errors={state.fieldErrors?.institutionId ? [{ message: state.fieldErrors.institutionId }] : undefined} />
          </Field>
        </FieldGroup>

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
              maxDate={getLatestAllowedBirthDate()}
              onChange={setBirthDate}
              value={birthDate}
            />
            <FieldError errors={state.fieldErrors?.birthDate ? [{ message: state.fieldErrors.birthDate }] : undefined} />
          </Field>
        </div>

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
                <Loader2Icon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
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
    </form>
  );
}
