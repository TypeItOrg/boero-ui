"use client";

import { useActionState, useState, type ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { cn } from "@common/utils/cn.util";

import { updateAcademicStatusAction } from "@features/academic/actions/update-academic-status.action";
import { COURSE_STATUS_DIALOG_CONFIG } from "@features/academic/config/course-status-dialog.config";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { CourseStatus } from "@features/academic/types/course-status.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type CourseStatusDialogProps = {
  id: string;
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  resourceLabel: string;
  returnTo: string;
  scope: AcademicScope;
  targetStatus: CourseStatus;
};

const INITIAL_STATE: AcademicActionState = {};

export function CourseStatusDialog({
  id,
  institutionId,
  onOpenChange,
  open,
  resourceLabel,
  returnTo,
  scope,
  targetStatus,
}: CourseStatusDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, AcademicResource.COURSE, id, returnTo),
    INITIAL_STATE,
  );

  const config = COURSE_STATUS_DIALOG_CONFIG[targetStatus];
  const Icon = config.icon;

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <form action={formAction}>
          <AlertDialogHeader>
            <div className={cn(config.iconClassName, "mb-1 flex size-12 items-center justify-center rounded-2xl")}>
              <Icon className="size-6" />
            </div>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
            <AlertDialogDescription>{config.description(resourceLabel)}</AlertDialogDescription>
          </AlertDialogHeader>

          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <input type="hidden" name="status" value={targetStatus} />

          <AlertDialogFooter className="mt-5">
            <AlertDialogCancel type="button" size="lg" disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button type="submit" size="lg" variant={config.variant} disabled={isPending}>
              {isPending ? config.pendingLabel : config.actionLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CourseDetailStatusActions({
  courseStatus,
  id,
  institutionId,
  resourceLabel,
  returnTo,
  scope,
}: {
  courseStatus: CourseStatus;
  id: string;
  institutionId: string;
  resourceLabel: string;
  returnTo: string;
  scope: AcademicScope;
}): ReactElement | null {
  const [toggleOpen, setToggleOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  if (courseStatus === "CLOSED") {
    return null;
  }

  const toggleTarget: CourseStatus = courseStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const toggleConfig = COURSE_STATUS_DIALOG_CONFIG[toggleTarget];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="lg" variant={toggleConfig.variant} onClick={() => setToggleOpen(true)}>
        {toggleTarget === "ACTIVE" ? "Activar" : "Desactivar"}
      </Button>
      {toggleOpen ? (
        <CourseStatusDialog
          id={id}
          institutionId={institutionId}
          onOpenChange={setToggleOpen}
          open={toggleOpen}
          resourceLabel={resourceLabel}
          returnTo={returnTo}
          scope={scope}
          targetStatus={toggleTarget}
        />
      ) : null}
      <Button type="button" size="lg" variant="destructive" onClick={() => setFinalizeOpen(true)}>
        Finalizar
      </Button>
      {finalizeOpen ? (
        <CourseStatusDialog
          id={id}
          institutionId={institutionId}
          onOpenChange={setFinalizeOpen}
          open={finalizeOpen}
          resourceLabel={resourceLabel}
          returnTo={returnTo}
          scope={scope}
          targetStatus="CLOSED"
        />
      ) : null}
    </div>
  );
}
