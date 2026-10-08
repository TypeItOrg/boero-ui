"use client";

import { useActionState, useEffect, useRef, useState, startTransition, type SyntheticEvent } from "react";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { PasswordInput } from "@common/components/ui/password-input";
import { NumericInput } from "@common/components/ui/restricted-input";
import { consumeInstitutionalLoginFlashes } from "@features/institutional-auth/actions/consume-institutional-login-flashes.action";
import { institutionalCredentialsLogin } from "@features/institutional-auth/actions/institutional-credentials-login.action";
import type { InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { InstitutionalAuthInstitutionField } from "@features/institutional-auth/components/institutional-auth-institution-field";
import { InstitutionalPasskeyStep } from "@features/institutional-auth/components/institutional-passkey-step";
import { useInstitutionalBrand } from "@features/institutional-auth/components/institutional-brand-context";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { InstitutionalCredentialsLoginState } from "@features/institutional-auth/types/institutional-credentials-login-state.types";

type InstitutionalLoginFormProps = { emailVerified?: boolean; passwordChanged?: boolean };

export function InstitutionalLoginForm({ emailVerified = false, passwordChanged = false }: InstitutionalLoginFormProps): React.ReactElement {
  const fixedInstitution = useInstitutionalBrand();
  const [institution, setInstitution] = useState<InstitutionalInstitution>();
  const [documentNumber, setDocumentNumber] = useState("");
  const [method, setMethod] = useState<"PASSWORD" | "PASSKEY">("PASSWORD");
  const [revision, setRevision] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<{ pending: boolean; error: string | null }>({ pending: false, error: null });
  const [passkeyFieldErrors, setPasskeyFieldErrors] = useState<InstitutionalCredentialsLoginState["fieldErrors"]>({});
  const pendingRef = useRef(false);
  const revisionRef = useRef(0);
  // Keep one-time notices visible after consuming their cookies.
  const [showEmailVerified] = useState(emailVerified);
  const [showPasswordChanged] = useState(passwordChanged);
  const [passwordState, passwordAction, passwordPending] = useActionState<
    InstitutionalCredentialsLoginState & { revision?: number },
    { formData: FormData; revision: number }
  >(async (_previous, submitted) => {
    try {
      const result = await institutionalCredentialsLogin({}, submitted.formData);
      setPending(false);
      setError(result.error ?? null);
      return { ...result, revision: submitted.revision };
    } catch (error) {
      if (!isRedirectError(error)) {
        setPending(false);
      }
      throw error;
    }
  }, {});

  useEffect(() => {
    if (emailVerified || passwordChanged) {
      void consumeInstitutionalLoginFlashes();
    }
  }, [emailVerified, passwordChanged]);

  function setPending(pending: boolean): void {
    pendingRef.current = pending;
    setStatus((current) => ({ pending, error: pending ? null : current.error }));
  }

  function setError(error: string | null): void {
    setStatus((current) => ({ ...current, error }));
  }

  function invalidateInput(): void {
    setError(null);
    setPasskeyFieldErrors({});
    revisionRef.current += 1;
    setRevision(revisionRef.current);
  }

  function changeDocument(value: string): void {
    if (pendingRef.current || value === documentNumber) {
      return;
    }
    setDocumentNumber(value);
    invalidateInput();
  }

  function changeInstitution(value: InstitutionalInstitution | undefined): void {
    if (pendingRef.current) {
      return;
    }
    if (value?.id !== institution?.id) {
      invalidateInput();
    }
    setInstitution(value);
  }

  function changeMethod(value: "PASSWORD" | "PASSKEY"): void {
    if (pendingRef.current) {
      return;
    }
    invalidateInput();
    setMethod(value);
  }

  function submitPassword(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (method !== "PASSWORD" || pendingRef.current || passwordPending) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    setPending(true);
    startTransition(() => passwordAction({ formData, revision }));
  }

  const fieldErrors = method === "PASSKEY" ? passkeyFieldErrors : passwordState.revision === revision ? passwordState.fieldErrors : undefined;
  const showNotice = !status.pending && !status.error && !Object.keys(fieldErrors ?? {}).length;
  const activeInstitution = fixedInstitution ?? institution;

  return (
    <div className="flex flex-col justify-center p-5 sm:p-8">
      <InstitutionalAuthStepHeader
        title="Bienvenido de nuevo"
        showInstitutionName={false}
        description="Ingresá con tu contraseña o una llave de acceso."
      />
      <form className="mt-6 space-y-6" onSubmit={submitPassword} noValidate>
        {showEmailVerified && showNotice ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>¡Listo! Correo electrónico confirmado</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_VERIFIED}</AlertDescription>
          </Alert>
        ) : null}
        {showPasswordChanged && showNotice ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_TITLE}</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_DESCRIPTION}</AlertDescription>
          </Alert>
        ) : null}
        {status.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        ) : null}
        <InstitutionalAuthInstitutionField
          id="institution-id"
          institution={institution}
          onChange={changeInstitution}
          disabled={status.pending}
          error={fieldErrors?.institutionId}
        />
        <Field data-invalid={Boolean(fieldErrors?.documentNumber)}>
          <FieldLabel htmlFor="document-number">Documento</FieldLabel>
          <NumericInput
            id="document-number"
            name="documentNumber"
            value={documentNumber}
            onChange={(event) => changeDocument(event.target.value)}
            disabled={status.pending}
            autoComplete="username"
            maxLength={8}
            aria-invalid={Boolean(fieldErrors?.documentNumber)}
          />
          <FieldError errors={fieldErrors?.documentNumber ? [{ message: fieldErrors.documentNumber }] : undefined} />
        </Field>
        {method === "PASSWORD" ? (
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
        ) : (
          <InstitutionalPasskeyStep
            key={revision}
            isCurrentIdentity={() => revisionRef.current === revision}
            input={{ institutionId: activeInstitution?.id ?? "", institutionName: activeInstitution?.name, documentNumber }}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
            onPendingChange={setPending}
            onError={setError}
            onFieldErrors={setPasskeyFieldErrors}
            onUsePassword={() => changeMethod("PASSWORD")}
          />
        )}
        <p className="text-muted-foreground text-center text-sm">
          ¿No tenés una cuenta?{" "}
          <Link className="text-primary font-medium underline underline-offset-4" href="/auth/register">
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
