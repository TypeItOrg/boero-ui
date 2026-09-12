"use client";

import { useEffect, useRef, useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { FingerprintIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { InstitutionalPasskeyPrompt } from "@features/institutional-auth/components/institutional-passkey-prompt";
import { Checkbox } from "@common/components/ui/checkbox";
import { Field, FieldLabel } from "@common/components/ui/field";
import { beginPasskeyLogin } from "@features/institutional-auth/actions/begin-passkey-login.action";
import { finishPasskeyLogin } from "@features/institutional-auth/actions/finish-passkey-login.action";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { getPasskeyAssertion, isUserCancelled, toPublicKeyRequestOptions } from "@features/institutional-auth/utils/passkey-authentication.util";
import { useWebAuthnSupport } from "@features/institutional-auth/hooks/use-webauthn-support.hook";

type PasskeyCeremonyState = { phase: "idle" | "requesting" | "verifying" };
type InstitutionalPasskeyStepProps = {
  loginAttemptId: string;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
  onPendingChange: (pending: boolean) => void;
  onError: (message: string | null) => void;
  onUsePassword: () => void;
};

export function InstitutionalPasskeyStep({
  loginAttemptId,
  rememberMe,
  onRememberMeChange,
  onPendingChange,
  onError,
  onUsePassword,
}: InstitutionalPasskeyStepProps): React.ReactElement {
  const [ceremony, setCeremony] = useState<PasskeyCeremonyState>({ phase: "idle" });
  const ceremonyRef = useRef<AbortController | null>(null);
  const webauthnSupported = useWebAuthnSupport();
  const passkeyPending = ceremony.phase !== "idle";
  const passkeyVerifying = ceremony.phase === "verifying";

  // Cancel the external browser prompt when navigating away from this step.
  useEffect(() => {
    return () => {
      ceremonyRef.current?.abort();
      ceremonyRef.current = null;
    };
  }, []);

  function abortCeremony(): void {
    ceremonyRef.current?.abort();
    ceremonyRef.current = null;
  }

  function handleCancelCeremony(): void {
    if (passkeyVerifying) return;

    abortCeremony();
    setCeremony({ phase: "idle" });
  }

  function handleUsePassword(): void {
    if (passkeyVerifying) return;

    abortCeremony();
    setCeremony({ phase: "idle" });
    onUsePassword();
  }

  async function handlePasskeyLogin(): Promise<void> {
    if (!loginAttemptId || ceremonyRef.current) return;

    const controller = new AbortController();
    ceremonyRef.current = controller;
    setCeremony({ phase: "requesting" });
    onError(null);

    try {
      const begin = await beginPasskeyLogin(loginAttemptId);

      if (ceremonyRef.current !== controller) return;

      if (begin.error || !begin.ceremonyId || !begin.options) {
        onError(begin.error ?? INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED);
        return;
      }

      const requestOptions = toPublicKeyRequestOptions(begin.options);
      const credential = await getPasskeyAssertion(requestOptions, controller.signal);

      if (ceremonyRef.current !== controller) return;

      setCeremony({ phase: "verifying" });
      onPendingChange(true);
      const finish = await finishPasskeyLogin({
        loginAttemptId,
        ceremonyId: begin.ceremonyId,
        credentialJson: JSON.stringify(credential),
        rememberMe,
      });

      if (ceremonyRef.current !== controller) return;

      if (finish.error) {
        onError(finish.error);
      }
    } catch (error) {
      if (isRedirectError(error)) {
        // Next already navigates from the action response; keep the controls locked until unmount.
        ceremonyRef.current = null;
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[passkey] login ceremony settled with error", error instanceof DOMException ? error.name : error?.constructor?.name);
      }

      if (ceremonyRef.current !== controller) return;

      if (isUserCancelled(error)) {
        return;
      }

      onError(INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_FAILED);
    } finally {
      if (ceremonyRef.current === controller) {
        ceremonyRef.current = null;
        onPendingChange(false);
        setCeremony({ phase: "idle" });
      }
    }
  }

  return (
    <div>
      <div className="space-y-6">
        {webauthnSupported === false ? (
          <Alert>
            <FingerprintIcon className="size-4" />
            <AlertTitle>Llaves de acceso no disponibles</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_UNSUPPORTED}</AlertDescription>
          </Alert>
        ) : null}

        <Field orientation="horizontal">
          <Checkbox
            id="remember-me-passkey"
            className="mt-px"
            checked={rememberMe}
            onCheckedChange={(checked) => onRememberMeChange(checked === true)}
          />
          <FieldLabel htmlFor="remember-me-passkey" className="font-normal">
            Recordarme
          </FieldLabel>
        </Field>

        <InstitutionalPasskeyPrompt
          pending={passkeyPending}
          verifying={passkeyVerifying}
          supported={webauthnSupported === true}
          onContinue={() => void handlePasskeyLogin()}
          onCancel={handleCancelCeremony}
          onUsePassword={handleUsePassword}
        />
      </div>
    </div>
  );
}
