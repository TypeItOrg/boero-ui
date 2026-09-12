"use client";

import { startTransition, useActionState, type SyntheticEvent } from "react";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@common/components/ui/field";

import { Input } from "@common/components/ui/input";
import { renamePasskeyAction } from "@features/institutional-auth/actions/passkey-management.actions";
import type { Passkey } from "@features/institutional-auth/types/passkey.types";
import type { RenamePasskeyState } from "@features/institutional-auth/types/rename-passkey-state.types";

type PasskeyRenameDialogProps = { passkey: Passkey; onClose: () => void; onSuccess: () => void };

export function PasskeyRenameDialog({ passkey, onClose, onSuccess }: PasskeyRenameDialogProps): React.ReactElement {
  const [state, action, isPending] = useActionState<RenamePasskeyState, FormData>(async (previous, formData) => {
    try {
      const result = await renamePasskeyAction(passkey.id, previous, formData);
      if (result.success) onSuccess();
      return result;
    } catch {
      return { error: "No se pudo renombrar la clave de acceso." };
    }
  }, {});

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  const error = state.fieldErrors?.label ?? state.error;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renombrar clave de acceso</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="passkey-rename" required>
              Nombre
            </FieldLabel>
            <Input disabled={isPending} id="passkey-rename" name="label" maxLength={100} defaultValue={passkey.label} />
            <FieldError>{error}</FieldError>
          </Field>
          <DialogFooter>
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
