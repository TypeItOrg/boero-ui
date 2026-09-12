"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { requestPasskeyRegistration, verifyPasskeyRegistrationAction } from "@features/institutional-auth/actions/passkey-registration.actions";
import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import { useWebAuthnSupport } from "@features/institutional-auth/hooks/use-webauthn-support.hook";
import type { VerifyPasskeyRegistrationState } from "@features/institutional-auth/types/verify-passkey-registration-state.types";
import { createPasskeyCredential, toPublicKeyCreationOptions } from "@features/institutional-auth/utils/passkey-registration.util";
import { isUserCancelled } from "@features/institutional-auth/utils/passkey-authentication.util";

type PasskeyRegistrationDialogProps = {
  initialLabel: string;
  onClose: () => void;
  onSuccess: () => void;
  onRequireReauth: (label: string) => void;
};

export function PasskeyRegistrationDialog({ initialLabel, onClose, onSuccess, onRequireReauth }: PasskeyRegistrationDialogProps): React.ReactElement {
  const ceremonyRef = useRef<AbortController | null>(null);
  const [verifying, setVerifying] = useState(false);
  const webauthnSupported = useWebAuthnSupport();
  const [state, action, isPending] = useActionState<VerifyPasskeyRegistrationState, FormData>(register, {});

  // WebAuthn is external to React: dismiss its prompt when this dialog unmounts.
  useEffect(() => {
    return () => {
      ceremonyRef.current?.abort();
      ceremonyRef.current = null;
    };
  }, []);

  async function register(_previous: VerifyPasskeyRegistrationState, formData: FormData): Promise<VerifyPasskeyRegistrationState> {
    const label = String(formData.get("label") ?? "").trim();
    if (!webauthnSupported) return { error: "Las claves de acceso no están disponibles en este navegador." };
    const controller = new AbortController();
    ceremonyRef.current = controller;

    try {
      const options = await requestPasskeyRegistration({}, formData);
      if (controller.signal.aborted) return {};
      if (options.fieldErrors?.label) return { error: options.fieldErrors.label };
      if (options.error === RECENT_AUTH_REQUIRED) {
        onRequireReauth(label);
        return {};
      }
      if (options.error || !options.ceremonyId || !options.options) {
        return { error: options.error ?? "No se pudo iniciar el registro de la clave de acceso." };
      }

      const credential = await createPasskeyCredential(toPublicKeyCreationOptions(options.options), controller.signal);
      if (controller.signal.aborted) return {};

      setVerifying(true);
      const result = await verifyPasskeyRegistrationAction(options.ceremonyId, credential);
      if (controller.signal.aborted) return {};
      if (result.error === RECENT_AUTH_REQUIRED) {
        onRequireReauth(label);
        return {};
      }
      if (result.error) return result;
      onSuccess();
      return {};
    } catch (error) {
      if (controller.signal.aborted || isUserCancelled(error)) return {};
      return { error: "No se pudo registrar la clave de acceso." };
    } finally {
      if (ceremonyRef.current === controller) {
        ceremonyRef.current = null;
        setVerifying(false);
      }
    }
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  function close(): void {
    if (verifying) return;
    ceremonyRef.current?.abort();
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir clave de acceso</DialogTitle>
          <DialogDescription>Elegí un nombre para reconocer esta clave de acceso en tus dispositivos.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field data-invalid={!!state.error}>
            <FieldLabel htmlFor="passkey-label" required>
              Nombre
            </FieldLabel>
            <Input disabled={isPending} id="passkey-label" name="label" maxLength={100} defaultValue={initialLabel} />
            <FieldError>{state.error}</FieldError>
          </Field>
          <DialogFooter>
            <Button disabled={verifying} onClick={close} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2Icon aria-hidden="true" className="animate-spin" />
                  Registrando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
