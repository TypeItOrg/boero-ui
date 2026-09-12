"use client";

import { startTransition, useActionState, type SyntheticEvent } from "react";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { FieldError } from "@common/components/ui/field";

import { revokePasskeyAction } from "@features/institutional-auth/actions/passkey-management.actions";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { RECENT_AUTH_REQUIRED } from "@features/institutional-auth/constants/passkey.constants";
import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import type { RevokePasskeyState } from "@features/institutional-auth/types/revoke-passkey-state.types";

type PasskeyRevokeDialogProps = { passkey: Passkey; onClose: () => void; onSuccess: () => void; onRequireReauth: () => void };

export function PasskeyRevokeDialog({ passkey, onClose, onSuccess, onRequireReauth }: PasskeyRevokeDialogProps): React.ReactElement {
  const [state, action, isPending] = useActionState<RevokePasskeyState>(async () => {
    try {
      const result = await revokePasskeyAction(passkey.id);
      if (result.error === RECENT_AUTH_REQUIRED) {
        onRequireReauth();
      } else if (result.success) {
        onSuccess();
      }
      return result;
    } catch {
      return { error: INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSKEY_REVOKE_FAILED };
    }
  }, {});

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPending) return;
    startTransition(() => action());
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar llave de acceso</DialogTitle>
          <DialogDescription>Se eliminará «{passkey.label}». Podrás seguir ingresando con tu contraseña u otras llaves de acceso.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldError>{state.error}</FieldError>
          <DialogFooter>
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit" variant="destructive">
              Eliminar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
