"use client";

import { SyntheticEvent, useActionState, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";
import {
  InstitutionPicker,
  type InstitutionalInstitution,
} from "@features/institutional-auth/components/institution-picker";
import { loginInstitutional } from "@features/institutional-auth/actions/institutional-login.action";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { InstitutionalLoginActionState } from "@features/institutional-auth/types/institutional-login-state.types";

const INITIAL_STATE: InstitutionalLoginActionState = {};

type InstitutionalLoginFormProps = {
  registered?: boolean;
};

export function InstitutionalLoginForm({ registered = false }: InstitutionalLoginFormProps): React.ReactElement {
  const [state, formAction] = useActionState<InstitutionalLoginActionState, FormData>(
    loginInstitutional,
    INITIAL_STATE,
  );
  const [isPending, startTransition] = useTransition();
  const [institution, setInstitution] = useState<InstitutionalInstitution>();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <header className="flex flex-col items-center space-y-1 text-center">
        <Image
          width={875}
          height={1202}
          src={"/boero-logo.webp"}
          alt={"Logo de la institución"}
          className="h-auto w-20 md:hidden"
        />
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground text-sm">
          <span className="hidden md:block">Ingresá tus credenciales para acceder a tu institución.</span>
          <span className="md:hidden">Ingresá tus credenciales para continuar.</span>
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {registered && !isPending && !state.error && Object.keys(state.fieldErrors ?? {}).length === 0 ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>Cuenta creada</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.REGISTERED}</AlertDescription>
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
        </FieldGroup>

        <FieldGroup>
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

        <FieldGroup>
          <Field data-invalid={!!state.fieldErrors?.password}>
            <FieldLabel htmlFor="password" required>
              Contraseña
            </FieldLabel>
            <PasswordInput
              aria-invalid={!!state.fieldErrors?.password}
              autoComplete="current-password"
              id="password"
              name="password"
            />
            <FieldError errors={state.fieldErrors?.password ? [{ message: state.fieldErrors.password }] : undefined} />
          </Field>
        </FieldGroup>

        <Field orientation="horizontal" className="gap-2">
          <Checkbox id="remember-me" name="rememberMe" />
          <FieldLabel htmlFor="remember-me" className="font-normal">
            Recordarme
          </FieldLabel>
        </Field>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button aria-busy={isPending} className="relative w-full" disabled={isPending} size="lg" type="submit">
            <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isPending && "opacity-0")}>
              Iniciar sesión
            </span>
            {isPending ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                <Loader2Icon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                <span className="sr-only" role="status" aria-live="polite">
                  Ingresando...
                </span>
              </span>
            ) : null}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            ¿No tenés una cuenta?{" "}
            <Link className="text-primary font-medium underline underline-offset-4" href="/auth/register">
              Crear cuenta
            </Link>
          </p>
        </footer>
      </div>
    </form>
  );
}
