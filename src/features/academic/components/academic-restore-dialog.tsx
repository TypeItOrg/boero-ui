"use client";

import { ArchiveRestoreIcon, CircleAlertIcon } from "lucide-react";
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
import { restoreAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicRestoreDialogProps = {
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
    | AcademicResource.COURSE;
  scope: AcademicScope;
};

const INITIAL_STATE: AcademicActionState = {};

export function AcademicRestoreDialog(props: AcademicRestoreDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    restoreAcademicResourceAction.bind(null, props.scope, props.institutionId, props.resource, props.id, props.destination),
    INITIAL_STATE,
  );

  function handleOpenChange(open: boolean): void {
    if (isPending && !open) return;
    props.onOpenChange(open);
  }

  return (
    <AlertDialog open={props.open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
              <ArchiveRestoreIcon aria-hidden="true" className="size-6" />
            </div>
            <AlertDialogTitle>Restaurar {props.label}</AlertDialogTitle>
            <AlertDialogDescription>
              El registro volverá a estar disponible con el estado operativo que tenía antes de eliminarse.
            </AlertDialogDescription>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Restaurando…" : "Restaurar"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
