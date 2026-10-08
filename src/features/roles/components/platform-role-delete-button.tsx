"use client";

import { useState, useTransition, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { CircleAlertIcon, Trash2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
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
}): ReactElement {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState<string>();

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
          <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
            <Trash2Icon className="size-6" />
          </div>
          <AlertDialogTitle>
            ¿Eliminar “<span className="text-foreground font-semibold">{roleName}</span>”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El rol solo puede eliminarse si no tiene usuarios asignados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
