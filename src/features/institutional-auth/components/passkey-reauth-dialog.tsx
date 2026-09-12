"use client";

import { startTransition, useActionState, type SyntheticEvent } from "react";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";

import { PasswordInput } from "@common/components/ui/password-input";
import { reAuthenticateAction } from "@features/institutional-auth/actions/passkey-management.actions";
import type { ReAuthenticateState } from "@features/institutional-auth/types/re-authenticate-state.types";

type PasskeyReauthDialogProps = { onClose: () => void; onVerified: () => Promise<ReAuthenticateState> };

export function PasskeyReauthDialog({ onClose, onVerified }: PasskeyReauthDialogProps): React.ReactElement {
  const [state, action, isPending] = useActionState<ReAuthenticateState, FormData>(async (previous, formData) => {
    try {
      const result = await reAuthenticateAction(previous, formData);
      if (!result.success) return result;
      return await onVerified();
    } catch {
      return { error: "No se pudo completar la operación. Intentá nuevamente." };
    }
  }, {});

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  const error = state.fieldErrors?.password ?? state.error;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmá tu identidad</DialogTitle>
          <DialogDescription>Ingresá tu contraseña para continuar. Esta confirmación es válida por unos minutos.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="reauth-password" required>
              Contraseña
            </FieldLabel>
            <PasswordInput autoComplete="current-password" disabled={isPending} id="reauth-password" name="password" />
            <FieldError>{error}</FieldError>
          </Field>
          <DialogFooter>
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
