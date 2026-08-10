"use client";

import { useState, useTransition } from "react";

import { Button } from "@common/components/ui/button";
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
import { deleteAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicDeleteButtonProps = {
  scope: AcademicScope;
  institutionId: string;
  resource: AcademicResource.ACADEMIC_LEVEL | AcademicResource.STUDY_PLAN_SPACE | AcademicResource.PREREQUISITE;
  id: string;
  destination: string;
  label: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

export function AcademicDeleteButton(props: AcademicDeleteButtonProps): React.ReactElement {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleDelete(): void {
    startTransition(async () => {
      const result = await deleteAcademicResourceAction(
        props.scope,
        props.institutionId,
        props.resource,
        props.id,
        props.destination,
      );
      if (result?.error) setError(result.error);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size={props.size}>
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {props.label}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Las relaciones protegidas impedirán la eliminación.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={pending}
            variant="destructive"
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
