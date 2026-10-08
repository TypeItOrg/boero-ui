"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import Link from "next/link";

import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";

export function InstitutionalPasswordLoginFields({
  fieldErrors,
  status,
  rememberMe,
  setRememberMe,
  changeMethod,
}: {
  fieldErrors: Partial<Record<"institutionId" | "documentNumber" | "password", string>> | undefined;
  status: { pending: boolean; error: string | null };
  rememberMe: boolean;
  setRememberMe: Dispatch<SetStateAction<boolean>>;
  changeMethod: (value: "PASSWORD" | "PASSKEY") => void;
}): ReactElement {
  return (
    <>
      <Field data-invalid={Boolean(fieldErrors?.password)}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <FieldLabel htmlFor="password" required>
            Contraseña
          </FieldLabel>
          <Link className="text-primary text-sm font-medium underline underline-offset-4" href="/auth/password-recovery">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          disabled={status.pending}
          aria-invalid={Boolean(fieldErrors?.password)}
        />
        <FieldError errors={fieldErrors?.password ? [{ message: fieldErrors.password }] : undefined} />
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id="remember-me"
          name="rememberMe"
          className="mt-px"
          checked={rememberMe}
          disabled={status.pending}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <FieldLabel htmlFor="remember-me" className="font-normal">
          Recordarme
        </FieldLabel>
      </Field>
      <footer className="flex w-full flex-col gap-2">
        <Button aria-busy={status.pending} className="relative w-full" disabled={status.pending} size="lg" type="submit">
          <span className={status.pending ? "opacity-0" : undefined}>Iniciar sesión</span>
          {status.pending ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
              <span className="sr-only" role="status">
                Iniciando sesión...
              </span>
            </span>
          ) : null}
        </Button>
        <Button className="w-full" disabled={status.pending} size="lg" type="button" variant="outline" onClick={() => changeMethod("PASSKEY")}>
          Usar una llave de acceso
        </Button>
      </footer>
    </>
  );
}
