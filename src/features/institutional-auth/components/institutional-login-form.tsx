"use client";

import { SyntheticEvent, useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, FingerprintIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";
import { beginPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";
import { consumeInstitutionalPasswordChangedFlash } from "@features/institutional-auth/actions/consume-institutional-password-changed-flash.action";
import { finishPasskeyLogin } from "@features/institutional-auth/actions/finish-passkey-login.action";
import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { InstitutionPicker, type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { InstitutionalPasswordStep } from "@features/institutional-auth/components/institutional-password-step";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { InstitutionalIdentifyActionState } from "@features/institutional-auth/types/institutional-identify-state.types";
import type { InstitutionalLoginStep } from "@features/institutional-auth/types/institutional-login-step.types";
import { getPasskeyAssertion, isUserCancelled, toPublicKeyRequestOptions } from "@features/institutional-auth/utils/passkey-authentication.util";
import { useWebAuthnSupport } from "@features/institutional-auth/hooks/use-webauthn-support.hook";

const INITIAL_IDENTIFY_STATE: InstitutionalIdentifyActionState = {};

type InstitutionalLoginFormProps = {
  registered?: boolean;
  passwordChanged?: boolean;
};

export function InstitutionalLoginForm({ registered = false, passwordChanged = false }: InstitutionalLoginFormProps): React.ReactElement {
  const [step, setStep] = useState<InstitutionalLoginStep>("IDENTIFIER");
  const [loginAttemptId, setLoginAttemptId] = useState<string | null>(null);
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const [institution, setInstitution] = useState<InstitutionalInstitution>();
  const [showPasswordChanged] = useState(passwordChanged);

  const [identifyState, identifyAction] = useActionState<InstitutionalIdentifyActionState, FormData>(
    identifyInstitutionalUser,
    INITIAL_IDENTIFY_STATE,
  );
  const [isIdentifyPending, startIdentifyTransition] = useTransition();
  const [appliedIdentifyState, setAppliedIdentifyState] = useState<InstitutionalIdentifyActionState>(INITIAL_IDENTIFY_STATE);

  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const webauthnSupported = useWebAuthnSupport();
  const [rememberMe, setRememberMe] = useState(false);
  const ceremonyRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      ceremonyRef.current?.abort();
      ceremonyRef.current = null;
    };
  }, []);

  if (identifyState !== appliedIdentifyState) {
    setAppliedIdentifyState(identifyState);

    if (identifyState.loginAttemptId && identifyState.nextStep) {
      setLoginAttemptId(identifyState.loginAttemptId);
      setHasPasskeys(identifyState.nextStep === "PASSKEY");
      setPasskeyError(null);
      setStep(identifyState.nextStep);
    }
  }

  const hasIdentifyFieldErrors = Object.keys(identifyState.fieldErrors ?? {}).length > 0;
  const canShowSuccessMessage = step === "IDENTIFIER" && !isIdentifyPending && !identifyState.error && !hasIdentifyFieldErrors;

  useEffect(() => {
    if (!passwordChanged) return;

    void consumeInstitutionalPasswordChangedFlash();
  }, [passwordChanged]);

  function handleIdentifySubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startIdentifyTransition(() => identifyAction(formData));
  }

  function handleChangeAccount(): void {
    abortCeremony();
    setPasskeyPending(false);
    setStep("IDENTIFIER");
    setLoginAttemptId(null);
    setHasPasskeys(false);
    setPasskeyError(null);
  }

  function abortCeremony(): void {
    ceremonyRef.current?.abort();
    ceremonyRef.current = null;
  }

  function handleCancelCeremony(): void {
    abortCeremony();
    setPasskeyPending(false);
    setPasskeyError(null);
  }

  function handleUsePassword(): void {
    abortCeremony();
    setPasskeyPending(false);
    setPasskeyError(null);
    setStep("PASSWORD");
  }

  async function handlePasskeyLogin(): Promise<void> {
    if (!loginAttemptId || ceremonyRef.current) return;

    const controller = new AbortController();
    ceremonyRef.current = controller;
    setPasskeyPending(true);
    setPasskeyError(null);

    try {
      const begin = await beginPasskeyLogin(loginAttemptId);

      if (ceremonyRef.current !== controller) return;

      if (begin.error || !begin.ceremonyId || !begin.options) {
        setPasskeyError(begin.error ?? INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED);
        return;
      }

      const requestOptions = toPublicKeyRequestOptions(begin.options);
      const credential = await getPasskeyAssertion(requestOptions, controller.signal);

      if (ceremonyRef.current !== controller) return;

      const finish = await finishPasskeyLogin({
        loginAttemptId,
        ceremonyId: begin.ceremonyId,
        credentialJson: JSON.stringify(credential),
        rememberMe,
      });

      if (ceremonyRef.current !== controller) return;

      if (finish.error) {
        setPasskeyError(finish.error);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[passkey] login ceremony settled with error", error instanceof DOMException ? error.name : error?.constructor?.name);
      }

      if (ceremonyRef.current !== controller) return;

      if (isUserCancelled(error)) {
        return;
      }

      setPasskeyError(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED);
    } finally {
      if (ceremonyRef.current === controller) {
        ceremonyRef.current = null;
        setPasskeyPending(false);
      }
    }
  }

  return (
    <div className="p-6 md:p-8">
      {step === "IDENTIFIER" ? (
        <form onSubmit={handleIdentifySubmit}>
          <InstitutionalAuthStepHeader title="Iniciar sesión" description="Ingresá tu institución y documento para continuar." />

          <div className="mt-6 space-y-6">
            {registered && canShowSuccessMessage ? (
              <Alert variant="success">
                <CheckCircle2Icon className="size-4" />
                <AlertTitle>Cuenta creada</AlertTitle>
                <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.REGISTERED}</AlertDescription>
              </Alert>
            ) : null}

            {showPasswordChanged && canShowSuccessMessage ? (
              <Alert variant="success">
                <CheckCircle2Icon className="size-4" />
                <AlertTitle>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_TITLE}</AlertTitle>
                <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_DESCRIPTION}</AlertDescription>
              </Alert>
            ) : null}

            {identifyState.error ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
                <AlertDescription>{identifyState.error}</AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              <Field data-invalid={!!identifyState.fieldErrors?.institutionId}>
                <FieldLabel htmlFor="institution-id" required>
                  Institución
                </FieldLabel>
                <InstitutionPicker
                  ariaInvalid={!!identifyState.fieldErrors?.institutionId}
                  id="institution-id"
                  onValueChange={(_, item) => setInstitution(item)}
                  selectedLabel={institution?.name}
                  value={institution?.id}
                />
                <FieldError errors={identifyState.fieldErrors?.institutionId ? [{ message: identifyState.fieldErrors.institutionId }] : undefined} />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field data-invalid={!!identifyState.fieldErrors?.documentNumber}>
                <FieldLabel htmlFor="document-number" required>
                  DNI
                </FieldLabel>
                <NumericInput
                  aria-invalid={!!identifyState.fieldErrors?.documentNumber}
                  autoComplete="username"
                  id="document-number"
                  maxLength={8}
                  name="documentNumber"
                />
                <FieldError
                  errors={identifyState.fieldErrors?.documentNumber ? [{ message: identifyState.fieldErrors.documentNumber }] : undefined}
                />
              </Field>
            </FieldGroup>

            <footer className="mt-6 flex w-full flex-col gap-4">
              <Button aria-busy={isIdentifyPending} className="relative w-full" disabled={isIdentifyPending} size="lg" type="submit">
                <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isIdentifyPending && "opacity-0")}>Continuar</span>
                {isIdentifyPending ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                    <Loader2Icon aria-hidden="true" className="animate-spin" />
                    <span className="sr-only" role="status" aria-live="polite">
                      Continuando...
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
      ) : null}

      {step === "PASSWORD" && loginAttemptId ? (
        <InstitutionalPasswordStep
          key={loginAttemptId}
          loginAttemptId={loginAttemptId}
          hasPasskeys={hasPasskeys}
          rememberMe={rememberMe}
          onRememberMeChange={setRememberMe}
          onUsePasskey={() => setStep("PASSKEY")}
          onChangeAccount={handleChangeAccount}
        />
      ) : null}

      {step === "PASSKEY" ? (
        <div>
          <InstitutionalAuthStepHeader title="Continuá con tu passkey" description="Usá una passkey asociada a tu cuenta para iniciar sesión." />

          <div className="mt-6 space-y-6">
            {passkeyError ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
                <AlertDescription>{passkeyError}</AlertDescription>
              </Alert>
            ) : null}

            {!webauthnSupported ? (
              <Alert>
                <FingerprintIcon className="size-4" />
                <AlertTitle>Passkeys no disponibles</AlertTitle>
                <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_UNSUPPORTED}</AlertDescription>
              </Alert>
            ) : null}

            <Field orientation="horizontal">
              <Checkbox
                id="remember-me-passkey"
                className="mt-px"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <FieldLabel htmlFor="remember-me-passkey" className="font-normal">
                Recordarme
              </FieldLabel>
            </Field>

            <footer className="mt-6 flex w-full flex-col gap-4">
              {passkeyPending ? (
                <>
                  <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm" role="status" aria-live="polite">
                    <Loader2Icon aria-hidden="true" className="animate-spin" />
                    Esperando tu passkey...
                  </p>
                  <Button className="w-full" onClick={handleCancelCeremony} size="lg" type="button" variant="outline">
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button className="relative w-full" disabled={!webauthnSupported} onClick={() => void handlePasskeyLogin()} size="lg" type="button">
                  <span className="inline-flex items-center gap-2 transition-opacity">
                    <FingerprintIcon aria-hidden="true" className="size-4" />
                    Ingresar con passkey
                  </span>
                </Button>
              )}
              <Button className="w-full" onClick={handleUsePassword} size="lg" type="button" variant="outline">
                Usar contraseña
              </Button>
              <button
                className="text-primary text-center text-sm font-medium underline underline-offset-4"
                onClick={handleChangeAccount}
                type="button"
              >
                Cambiar cuenta
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
