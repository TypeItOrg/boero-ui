"use client";

import { useState, useTransition } from "react";
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
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { deleteInstitutionRoleAction } from "@features/roles/actions/delete-institution-role.action";

export function InstitutionRoleDeleteButton({
  institutionId,
  roleId,
  roleName,
}: {
  institutionId: string;
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
          <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
            <Trash2Icon className="size-6" />
          </div>
          <AlertDialogTitle>
            Eliminar “<span className="text-foreground font-semibold">{roleName}</span>”
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es permanente y solo puede realizarse si el rol no tiene usuarios asignados.
          </AlertDialogDescription>
          {error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
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
                const result = await deleteInstitutionRoleAction(institutionId, roleId);
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
