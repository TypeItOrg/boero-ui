"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { consumeInstitutionalLoginFlashes } from "@features/institutional-auth/actions/consume-institutional-login-flashes.action";
import type { InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { InstitutionalIdentifyStep } from "@features/institutional-auth/components/institutional-identify-step";
import { InstitutionalPasswordStep } from "@features/institutional-auth/components/institutional-password-step";
import { InstitutionalPasskeyStep } from "@features/institutional-auth/components/institutional-passkey-step";
import type { InstitutionalLoginAttempt } from "@features/institutional-auth/types/institutional-login-attempt.types";
import type { InstitutionalLoginStep } from "@features/institutional-auth/types/institutional-login-step.types";

type LoginFlow = {
  institution?: InstitutionalInstitution;
  documentNumber: string;
  revision: number;
} & ({ step: "IDENTIFIER" } | { step: Exclude<InstitutionalLoginStep, "IDENTIFIER">; attempt: InstitutionalLoginAttempt });
type InstitutionalLoginFormProps = { emailVerified?: boolean; passwordChanged?: boolean };

export function InstitutionalLoginForm({ emailVerified = false, passwordChanged = false }: InstitutionalLoginFormProps): React.ReactElement {
  const [flow, setFlow] = useState<LoginFlow>({ step: "IDENTIFIER", documentNumber: "", revision: 0 });
  const [loginStatus, setLoginStatus] = useState<{ pending: boolean; error: string | null }>({ pending: false, error: null });
  const loginPending = loginStatus.pending;
  // Keep the initial notice visible after consuming its one-time cookie.
  const [showEmailVerified] = useState(emailVerified);
  const [showPasswordChanged] = useState(passwordChanged);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!emailVerified && !passwordChanged) return;
    void consumeInstitutionalLoginFlashes();
  }, [emailVerified, passwordChanged]);

  function setLoginPending(pending: boolean): void {
    setLoginStatus((current) => ({ pending, error: pending ? null : current.error }));
  }

  function setLoginError(error: string | null): void {
    setLoginStatus((current) => ({ ...current, error }));
  }

  function changeMethod(step: Exclude<InstitutionalLoginStep, "IDENTIFIER">): void {
    setLoginError(null);
    setFlow((current) => (current.step === "IDENTIFIER" ? current : { ...current, step }));
  }

  function handleIdentified(attempt: InstitutionalLoginAttempt, revision: number): void {
    setFlow((current) => (current.revision === revision ? { ...current, step: attempt.nextStep, attempt } : current));
  }

  function changeInstitution(institution: InstitutionalInstitution | undefined): void {
    if (loginPending) return;
    setLoginError(null);
    setFlow((current) =>
      current.institution?.id === institution?.id
        ? { ...current, institution }
        : {
            step: "IDENTIFIER",
            institution,
            documentNumber: current.documentNumber,
            revision: current.revision + 1,
          },
    );
  }

  function changeDocument(documentNumber: string): void {
    if (loginPending) return;
    setLoginError(null);
    setFlow((current) =>
      current.documentNumber === documentNumber
        ? current
        : {
            step: "IDENTIFIER",
            institution: current.institution,
            documentNumber,
            revision: current.revision + 1,
          },
    );
  }

  return (
    <div className="p-5 sm:p-8">
      <InstitutionalAuthStepHeader title="Bienvenido de nuevo" description="Ingresá tus credenciales para acceder a tu institución." />
      <div className="mt-6 space-y-6">
        {loginStatus.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{loginStatus.error}</AlertDescription>
          </Alert>
        ) : null}
        <InstitutionalIdentifyStep
          emailVerified={showEmailVerified}
          showPasswordChanged={showPasswordChanged}
          institution={flow.institution}
          documentNumber={flow.documentNumber}
          revision={flow.revision}
          identified={flow.step !== "IDENTIFIER"}
          disabled={loginPending}
          onInstitutionChange={changeInstitution}
          onDocumentChange={changeDocument}
          onIdentified={handleIdentified}
        />
        {flow.step !== "IDENTIFIER" ? (
          <div key={`${flow.attempt.loginAttemptId}-${flow.step}`} className="animate-fade-in-up">
            {flow.step === "PASSWORD" ? (
              <InstitutionalPasswordStep
                loginAttemptId={flow.attempt.loginAttemptId}
                hasPasskeys={flow.attempt.nextStep === "PASSKEY"}
                rememberMe={rememberMe}
                onRememberMeChange={setRememberMe}
                onPendingChange={setLoginPending}
                onError={setLoginError}
                onUsePasskey={() => changeMethod("PASSKEY")}
              />
            ) : (
              <InstitutionalPasskeyStep
                loginAttemptId={flow.attempt.loginAttemptId}
                rememberMe={rememberMe}
                onRememberMeChange={setRememberMe}
                onPendingChange={setLoginPending}
                onError={setLoginError}
                onUsePassword={() => changeMethod("PASSWORD")}
              />
            )}
          </div>
        ) : null}
        <p className="text-muted-foreground text-center text-sm">
          ¿No tenés una cuenta?{" "}
          <Link className="text-primary font-medium underline underline-offset-4" href="/auth/register">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
