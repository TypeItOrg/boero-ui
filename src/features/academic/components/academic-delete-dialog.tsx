"use client";

import { CircleAlertIcon, Trash2Icon } from "lucide-react";
import { useActionState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { deleteAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicDeleteDialogProps = {
  destination: string;
  id: string;
  institutionId: string;
  label: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  resource:
    | AcademicResource.ACADEMIC_YEAR
    | AcademicResource.TRAINING_PATH
    | AcademicResource.STUDY_PLAN
    | AcademicResource.ACADEMIC_SPACE
    | AcademicResource.INSTRUMENT
    | AcademicResource.ACADEMIC_LEVEL
    | AcademicResource.STUDY_PLAN_SPACE
    | AcademicResource.PREREQUISITE;
  scope: AcademicScope;
};

const INITIAL_STATE: AcademicActionState = {};

export function AcademicDeleteDialog(props: AcademicDeleteDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    deleteAcademicResourceAction.bind(null, props.scope, props.institutionId, props.resource, props.id, props.destination),
    INITIAL_STATE,
  );
  const isRootResource =
    props.resource === AcademicResource.ACADEMIC_YEAR ||
    props.resource === AcademicResource.TRAINING_PATH ||
    props.resource === AcademicResource.STUDY_PLAN ||
    props.resource === AcademicResource.ACADEMIC_SPACE ||
    props.resource === AcademicResource.INSTRUMENT;
  const description = isRootResource
    ? "El registro dejará de estar disponible en la operación habitual, pero conservará su historial y podrá restaurarse."
    : "Esta acción no se puede deshacer. Las relaciones protegidas impedirán la eliminación.";

  function handleOpenChange(open: boolean): void {
    if (isPending && !open) return;
    props.onOpenChange(open);
  }

  return (
    <AlertDialog open={props.open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <div className="bg-destructive/10 text-destructive mb-1 flex size-12 items-center justify-center rounded-2xl">
              <Trash2Icon aria-hidden="true" className="size-6" />
            </div>
            <AlertDialogTitle>Eliminar {props.label}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel type="button" disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button type="submit" disabled={isPending} variant="destructive">
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
