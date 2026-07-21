"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

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
import { deleteInstitutionRoleAction } from "@features/roles/actions/delete-institution-role.action";

export function InstitutionRoleDeleteButton({
  roleId,
  roleName,
}: {
  roleId: string;
  roleName: string;
}): React.ReactElement {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg">
          <Trash2Icon data-icon="inline-start" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar “{roleName}”</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es permanente y solo puede realizarse si el rol no tiene usuarios asignados.
          </AlertDialogDescription>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="lg"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              startTransition(async () => {
                const result = await deleteInstitutionRoleAction(roleId);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                router.replace("/roles");
              });
            }}
          >
            {pending ? "Eliminando…" : "Eliminar rol"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
