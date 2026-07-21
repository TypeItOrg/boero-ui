"use client";

import * as React from "react";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@common/components/ui/alert-dialog";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { safelyRunAction } from "@common/utils/safe-action.util";
import { deletePersonAction } from "@features/people/actions/delete-person.action";
import type { PeopleScope } from "@features/people/utils/people-scope.util";

type PersonDeleteDialogProps = {
  institutionId: string;
  personId: string;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  trigger?: React.ReactElement;
  scope?: PeopleScope;
};

export function PersonDeleteDialog({
  institutionId,
  personId,
  personName,
  open,
  onOpenChange,
  onDeleted,
  trigger,
  scope = "admin",
}: PersonDeleteDialogProps): React.ReactElement {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const buttonSize = scope === "institutional" ? "lg" : "default";

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) return;
    if (!nextOpen) setError(undefined);

    onOpenChange(nextOpen);
  }

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setError(undefined);

    startTransition(async () => {
      const result = await safelyRunAction(
        deletePersonAction(institutionId, personId, scope),
        PEOPLE_ERROR_MESSAGES.DELETE_FALLBACK,
      );

      if (!result.success) {
        setError(result.error ?? PEOPLE_ERROR_MESSAGES.DELETE_FALLBACK);
        return;
      }

      onOpenChange(false);
      onDeleted();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          <AlertDialogDescription>
            {personName} dejará de tener acceso y ya no aparecerá en los listados de la institución. Esta acción no
            elimina físicamente sus datos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{PEOPLE_ERROR_MESSAGES.DELETE_TITLE}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel size={buttonSize} disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction size={buttonSize} variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? "Eliminando..." : "Eliminar usuario"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
