"use client";

import { SyntheticEvent, useActionState, useTransition } from "react";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";

import { loginPlatform } from "@features/platform-auth/actions/platform-login.action";
import type { PlatformLoginActionState } from "@features/platform-auth/types/platform-login-action-state.types";

const INITIAL_STATE: PlatformLoginActionState = {};

export function PlatformLoginForm() {
  const [state, formAction] = useActionState(loginPlatform, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground text-sm">
          <span className="hidden md:block">Ingresá tus credenciales para acceder a tu cuenta.</span>
          <span className="md:hidden">Ingresá tus credenciales para continuar.</span>
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
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              aria-invalid={!!state.fieldErrors?.email}
              autoComplete="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
            />
            {state.fieldErrors?.email ? (
              <p className="text-destructive text-sm">{state.fieldErrors.email}</p>
            ) : null}
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <PasswordInput
              aria-invalid={!!state.fieldErrors?.password}
              autoComplete="current-password"
              id="password"
              name="password"
            />
            {state.fieldErrors?.password ? (
              <p className="text-destructive text-sm">{state.fieldErrors.password}</p>
            ) : null}
          </Field>
        </FieldGroup>

        <footer className="mt-6 flex w-full flex-col gap-4">
          <Button variant="default" type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </footer>
      </div>
    </form>
  );
}
