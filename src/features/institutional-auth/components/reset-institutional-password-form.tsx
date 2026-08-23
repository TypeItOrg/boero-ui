"use client";

import { useActionState } from "react";
import Image from "next/image";
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
    <form action={formAction} className="p-6 md:p-8">
      <input name="token" type="hidden" value={token} />
      <header className="flex flex-col items-center space-y-1 text-center">
        <Image width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-20 md:hidden" />
        <h1 className="text-2xl font-bold">Elegí una nueva contraseña</h1>
        <p className="text-muted-foreground text-sm">Ingresá una clave de al menos 8 caracteres.</p>
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
          <Field data-invalid={!!state.fieldErrors?.password}>
            <FieldLabel htmlFor="password" required>
              Nueva contraseña
            </FieldLabel>
            <PasswordInput aria-invalid={!!state.fieldErrors?.password} autoComplete="new-password" id="password" name="password" />
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
            <FieldError errors={state.fieldErrors?.confirmPassword ? [{ message: state.fieldErrors.confirmPassword }] : undefined} />
          </Field>
        </FieldGroup>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
            <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPending && "opacity-0")}>Restablecer contraseña</span>
            {isPending ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                <Loader2Icon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                <span className="sr-only" role="status" aria-live="polite">
                  Restableciendo...
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
