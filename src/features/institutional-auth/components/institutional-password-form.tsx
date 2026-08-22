"use client";

import { useActionState } from "react";
import { CircleAlertIcon, KeyRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { changeInstitutionalPasswordAction } from "@features/institutional-auth/actions/change-institutional-password.action";
import type { InstitutionalPasswordActionState } from "@features/institutional-auth/types/institutional-password-state.types";

const INITIAL_STATE: InstitutionalPasswordActionState = {};

export function InstitutionalPasswordForm(): React.ReactElement {
  const [state, formAction, isPending] = useActionState(changeInstitutionalPasswordAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? (
        <Alert variant="destructive">
          <CircleAlertIcon className="size-4" />
          <AlertTitle>¡Ups! No se pudo cambiar la contraseña</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
              <KeyRoundIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Nueva contraseña</h2>
              <p className="text-muted-foreground text-sm">Al confirmar el cambio se cerrará tu sesión en todos tus dispositivos.</p>
            </div>
          </div>
        </header>
        <div className="mt-4 sm:mt-5">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!state.fieldErrors?.currentPassword} className="basis-full">
              <FieldContent>
                <FieldLabel htmlFor="password-current" required>
                  Contraseña actual
                </FieldLabel>
              </FieldContent>
              <PasswordInput
                id="password-current"
                name="currentPassword"
                aria-invalid={!!state.fieldErrors?.currentPassword}
                autoComplete="current-password"
              />
              <FieldError>{state.fieldErrors?.currentPassword}</FieldError>
            </Field>

            <Field data-invalid={!!state.fieldErrors?.password} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="password-new" required>
                  Nueva contraseña
                </FieldLabel>
              </FieldContent>
              <PasswordInput id="password-new" name="password" aria-invalid={!!state.fieldErrors?.password} autoComplete="new-password" />
              <FieldError>{state.fieldErrors?.password}</FieldError>
            </Field>

            <Field data-invalid={!!state.fieldErrors?.confirmPassword} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="password-confirm" required>
                  Confirmar nueva contraseña
                </FieldLabel>
              </FieldContent>
              <PasswordInput
                id="password-confirm"
                name="confirmPassword"
                aria-invalid={!!state.fieldErrors?.confirmPassword}
                autoComplete="new-password"
              />
              <FieldError>{state.fieldErrors?.confirmPassword}</FieldError>
            </Field>
          </FieldGroup>
        </div>
      </div>

      <div className="flex flex-row flex-wrap justify-end gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Cambiando..." : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  );
}
