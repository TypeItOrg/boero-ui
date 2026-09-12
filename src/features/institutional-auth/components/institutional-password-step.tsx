"use client";

import { useActionState, useTransition, type SyntheticEvent } from "react";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { cn } from "@common/utils/cn.util";
import { institutionalPasswordLogin } from "@features/institutional-auth/actions/institutional-password-login.action";
import type { InstitutionalPasswordLoginActionState } from "@features/institutional-auth/types/institutional-password-login-state.types";

const INITIAL_PASSWORD_STATE: InstitutionalPasswordLoginActionState = {};

type InstitutionalPasswordStepProps = {
  loginAttemptId: string;
  hasPasskeys: boolean;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onPendingChange: (pending: boolean) => void;
  onError: (message: string | null) => void;
  onUsePasskey: () => void;
};

export function InstitutionalPasswordStep({
  loginAttemptId,
  hasPasskeys,
  rememberMe,
  onRememberMeChange,
  onPendingChange,
  onError,
  onUsePasskey,
}: InstitutionalPasswordStepProps): React.ReactElement {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<InstitutionalPasswordLoginActionState, FormData>(
    async (previous, formData) => {
      try {
        const result = await institutionalPasswordLogin(loginAttemptId, previous, formData);
        onError(result.error ?? null);
        onPendingChange(false);
        return result;
      } catch (error) {
        if (!isRedirectError(error)) onPendingChange(false);
        throw error;
      }
    },
    INITIAL_PASSWORD_STATE,
  );
  const [, startPasswordTransition] = useTransition();

  function handlePasswordSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPasswordPending) return;
    const formData = new FormData(event.currentTarget);
    onPendingChange(true);

    startPasswordTransition(() => passwordAction(formData));
  }

  return (
    <form onSubmit={handlePasswordSubmit}>
      <div className="space-y-6">
        <FieldGroup>
          <Field data-invalid={!!passwordState.fieldErrors?.password}>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
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

        <footer className="mt-6 flex w-full flex-col gap-2">
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
              Usar una llave de acceso
            </Button>
          ) : null}
        </footer>
      </div>
    </form>
  );
}
