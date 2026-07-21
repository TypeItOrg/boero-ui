"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, Trash2Icon } from "lucide-react";

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
import { Button } from "@common/components/ui/button";
import { deletePlatformRoleAction } from "@features/roles/actions/delete-platform-role.action";

export function PlatformRoleDeleteButton({
  roleId,
  institutionId,
  roleName,
}: {
  roleId: string;
  institutionId: string;
  roleName: string;
}): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function handleDelete(): void {
    setError(undefined);
    startTransition(async () => {
      const result = await deletePlatformRoleAction(institutionId, roleId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.replace("/admin/roles");
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg">
          <Trash2Icon data-icon="inline-start" />
          Eliminar rol
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar “{roleName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El rol solo puede eliminarse si no tiene usuarios asignados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <div className="text-destructive flex items-start gap-2 text-sm">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            {isPending ? "Eliminando…" : "Eliminar rol"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
