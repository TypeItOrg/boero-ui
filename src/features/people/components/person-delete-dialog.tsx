"use client";

import * as React from "react";
import { CircleAlertIcon, Trash2Icon } from "lucide-react";

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
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PersonDeleteDialogProps = {
  institutionId: string;
  personId: string;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  trigger?: React.ReactElement;
  scope?: PeopleScopeType;
};

export function PersonDeleteDialog({
  institutionId,
  personId,
  personName,
  open,
  onOpenChange,
  onDeleted,
  trigger,
  scope = PeopleScope.ADMIN,
}: PersonDeleteDialogProps): React.ReactElement {
  const [isPending, startTransition] = React.useTransition();
  const [isNavigating, startNavigation] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const buttonSize = PeopleScope.isInstitutional(scope) ? "lg" : "default";
  const isBusy = isPending || isNavigating;

  function handleOpenChange(nextOpen: boolean): void {
    if (isBusy && !nextOpen) return;
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

      startNavigation(onDeleted);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
            <Trash2Icon className="size-6" />
          </div>
          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-foreground font-semibold">{personName}</span> dejará de tener acceso y ya no aparecerá
            en los listados de la institución. Esta acción no elimina físicamente sus datos.
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
          <AlertDialogCancel size={buttonSize} disabled={isBusy}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction size={buttonSize} variant="destructive" disabled={isBusy} onClick={handleDelete}>
            {isBusy ? "Eliminando..." : "Eliminar usuario"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
