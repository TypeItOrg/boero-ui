"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";
import { requestPasswordRecovery } from "@features/institutional-auth/actions/request-institutional-password-recovery.action";
import {
  InstitutionPicker,
  type InstitutionalInstitution,
} from "@features/institutional-auth/components/institution-picker";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { PasswordRecoveryActionState } from "@features/institutional-auth/types/password-recovery-action-state.types";

const INITIAL_STATE: PasswordRecoveryActionState = {};

export function InstitutionalPasswordRecoveryForm(): React.ReactElement {
  const [state, formAction, isPending] = useActionState(requestPasswordRecovery, INITIAL_STATE);
  const [institution, setInstitution] = useState<InstitutionalInstitution>();

  return (
    <form action={formAction} className="space-y-6 p-6 md:p-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm">Ingresá tu institución y documento para recibir un enlace.</p>
      </header>

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
          <FieldError
            errors={state.fieldErrors?.institutionId ? [{ message: state.fieldErrors.institutionId }] : undefined}
          />
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
          <FieldError
            errors={state.fieldErrors?.documentNumber ? [{ message: state.fieldErrors.documentNumber }] : undefined}
          />
        </Field>
      </FieldGroup>

      <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
        <span className={cn(isPending && "opacity-0")}>Enviar enlace</span>
        {isPending ? <Loader2Icon className="absolute animate-spin" /> : null}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        <Link className="text-primary font-medium underline underline-offset-4" href="/auth/login">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}


