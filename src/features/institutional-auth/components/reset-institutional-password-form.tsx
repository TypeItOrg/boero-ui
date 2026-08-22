"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { resetPassword } from "@features/institutional-auth/actions/reset-institutional-password.action";
import type { ResetPasswordActionState } from "@features/institutional-auth/types/reset-password-action-state.types";

const INITIAL_STATE: ResetPasswordActionState = {};

export function ResetInstitutionalPasswordForm({ token }: { token: string }): React.ReactElement {
  const [state, formAction, isPending] = useActionState(resetPassword, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-6 p-6 md:p-8">
      <input name="token" type="hidden" value={token} />
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Elegí una nueva contraseña</h1>
        <p className="text-muted-foreground text-sm">Usá al menos 8 caracteres.</p>
      </header>

      {state.error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.password}>
          <FieldLabel htmlFor="password" required>
            Nueva contraseña
          </FieldLabel>
          <PasswordInput
            aria-invalid={!!state.fieldErrors?.password}
            autoComplete="new-password"
            id="password"
            name="password"
          />
          <FieldError errors={state.fieldErrors?.password ? [{ message: state.fieldErrors.password }] : undefined} />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.confirmPassword}>
          <FieldLabel htmlFor="confirm-password" required>
            Confirmar contraseña
          </FieldLabel>
          <PasswordInput
            aria-invalid={!!state.fieldErrors?.confirmPassword}
            autoComplete="new-password"
            id="confirm-password"
            name="confirmPassword"
          />
          <FieldError
            errors={state.fieldErrors?.confirmPassword ? [{ message: state.fieldErrors.confirmPassword }] : undefined}
          />
        </Field>
      </FieldGroup>

      <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
        <span className={cn(isPending && "opacity-0")}>Restablecer contraseña</span>
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


