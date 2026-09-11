"use client";

import { useActionState, useTransition, type SyntheticEvent } from "react";
import Link from "next/link";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { institutionalPasswordLogin } from "@features/institutional-auth/actions/institutional-password-login.action";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import type { InstitutionalPasswordLoginActionState } from "@features/institutional-auth/types/institutional-password-login-state.types";

const INITIAL_PASSWORD_STATE: InstitutionalPasswordLoginActionState = {};

type InstitutionalPasswordStepProps = {
  loginAttemptId: string;
  hasPasskeys: boolean;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onUsePasskey: () => void;
  onChangeAccount: () => void;
};

export function InstitutionalPasswordStep({
  loginAttemptId,
  hasPasskeys,
  rememberMe,
  onRememberMeChange,
  onUsePasskey,
  onChangeAccount,
}: InstitutionalPasswordStepProps): React.ReactElement {
  const [passwordState, passwordAction] = useActionState<InstitutionalPasswordLoginActionState, FormData>(
    institutionalPasswordLogin.bind(null, loginAttemptId),
    INITIAL_PASSWORD_STATE,
  );
  const [isPasswordPending, startPasswordTransition] = useTransition();

  function handlePasswordSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startPasswordTransition(() => passwordAction(formData));
  }

  return (
    <form onSubmit={handlePasswordSubmit}>
      <InstitutionalAuthStepHeader title="Bienvenido de nuevo" description="Ingresá tu contraseña para continuar." />

      <div className="mt-6 space-y-6">
        {passwordState.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{passwordState.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={!!passwordState.fieldErrors?.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password" required>
                Contraseña
              </FieldLabel>
              <Link className="text-primary text-sm font-medium underline underline-offset-4" href="/auth/password-recovery">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <PasswordInput aria-invalid={!!passwordState.fieldErrors?.password} autoComplete="current-password" id="password" name="password" />
            <FieldError errors={passwordState.fieldErrors?.password ? [{ message: passwordState.fieldErrors.password }] : undefined} />
          </Field>
        </FieldGroup>

        <Field orientation="horizontal">
          <Checkbox
            id="remember-me"
            name="rememberMe"
            className="mt-px"
            checked={rememberMe}
            onCheckedChange={(checked) => onRememberMeChange(checked === true)}
          />
          <FieldLabel htmlFor="remember-me" className="font-normal">
            Recordarme
          </FieldLabel>
        </Field>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button aria-busy={isPasswordPending} className="relative w-full" disabled={isPasswordPending} size="lg" type="submit">
            <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPasswordPending && "opacity-0")}>Iniciar sesión</span>
            {isPasswordPending ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                <Loader2Icon aria-hidden="true" className="animate-spin" />
                <span className="sr-only" role="status" aria-live="polite">
                  Ingresando...
                </span>
              </span>
            ) : null}
          </Button>
          {hasPasskeys ? (
            <Button className="w-full" disabled={isPasswordPending} onClick={onUsePasskey} size="lg" type="button" variant="outline">
              Usar una passkey
            </Button>
          ) : null}
          <button className="text-primary text-center text-sm font-medium underline underline-offset-4" onClick={onChangeAccount} type="button">
            Cambiar cuenta
          </button>
        </footer>
      </div>
    </form>
  );
}
