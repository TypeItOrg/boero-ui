"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";
import { requestPasswordRecovery } from "@features/institutional-auth/actions/request-institutional-password-recovery.action";
import { InstitutionPicker, type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { PasswordRecoveryActionState } from "@features/institutional-auth/types/password-recovery-action-state.types";

const INITIAL_STATE: PasswordRecoveryActionState = {};

export function InstitutionalPasswordRecoveryForm(): React.ReactElement {
  const [state, formAction, isPending] = useActionState(requestPasswordRecovery, INITIAL_STATE);
  const [institution, setInstitution] = useState<InstitutionalInstitution>();

  return (
    <form action={formAction} className="p-6 md:p-8">
      <header className="flex flex-col items-center space-y-1 text-center">
        <Image width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-20 md:hidden" />
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm">Ingresá tu institución y documento para recibir un enlace.</p>
      </header>

      <div className="mt-6 space-y-6">
        {state.success ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>Solicitud recibida</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_RECOVERY_SENT}</AlertDescription>
          </Alert>
        ) : null}
        {state.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={!!state.fieldErrors?.institutionId}>
            <FieldLabel htmlFor="institution-id" required>
              Institución
            </FieldLabel>
            <InstitutionPicker
              ariaInvalid={!!state.fieldErrors?.institutionId}
              id="institution-id"
              onValueChange={(_, item) => setInstitution(item)}
              selectedLabel={institution?.name}
              value={institution?.id}
            />
            <FieldError errors={state.fieldErrors?.institutionId ? [{ message: state.fieldErrors.institutionId }] : undefined} />
          </Field>
          <Field data-invalid={!!state.fieldErrors?.documentNumber}>
            <FieldLabel htmlFor="document-number" required>
              Documento
            </FieldLabel>
            <NumericInput
              aria-invalid={!!state.fieldErrors?.documentNumber}
              autoComplete="username"
              id="document-number"
              maxLength={8}
              name="documentNumber"
            />
            <FieldError errors={state.fieldErrors?.documentNumber ? [{ message: state.fieldErrors.documentNumber }] : undefined} />
          </Field>
        </FieldGroup>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
            <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPending && "opacity-0")}>Enviar enlace</span>
            {isPending ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                <Loader2Icon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                <span className="sr-only" role="status" aria-live="polite">
                  Enviando...
                </span>
              </span>
            ) : null}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            ¿Recordaste tu contraseña?{" "}
            <Link className="text-primary font-medium underline underline-offset-4" href="/auth/login">
              Iniciar sesión
            </Link>
          </p>
        </footer>
      </div>
    </form>
  );
}
