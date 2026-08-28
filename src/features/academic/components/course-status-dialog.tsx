"use client";

import * as React from "react";
import { GraduationCapIcon, CircleAlertIcon } from "lucide-react";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { cn } from "@common/utils/cn.util";
import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
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

type CourseStatusDialogConfig = {
  actionLabel: string;
  description: (resourceLabel: string) => React.ReactNode;
  icon: typeof GraduationCapIcon;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};

const COURSE_STATUS_DIALOG_CONFIG: Record<CourseStatus, CourseStatusDialogConfig> = {
  ACTIVE: {
    actionLabel: "Activar curso",
    description: (resourceLabel) => (
      <>
        El curso <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar activo para la institución.
      </>
    ),
    icon: GraduationCapIcon,
    iconClassName: "bg-primary/10 text-primary",
    pendingLabel: "Activando…",
    title: "Activar curso",
    variant: "default",
  },
  INACTIVE: {
    actionLabel: "Desactivar curso",
    description: (resourceLabel) => (
      <>
        El curso <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar activo. Los planes de estudio asociados no
        podrán desactivarse mientras tenga cursos activos.
      </>
    ),
    icon: GraduationCapIcon,
    iconClassName: "bg-destructive/10 text-destructive",
    pendingLabel: "Desactivando…",
    title: "Desactivar curso",
    variant: "destructive",
  },
  CLOSED: {
    actionLabel: "Finalizar curso",
    description: (resourceLabel) => (
      <>
        El curso <span className="text-foreground font-semibold">{resourceLabel}</span> se cerrará de forma definitiva y no podrá volver a editarse ni
        cambiar de estado.
      </>
    ),
    icon: GraduationCapIcon,
    iconClassName: "bg-destructive/10 text-destructive",
    pendingLabel: "Finalizando…",
    title: "Finalizar curso",
    variant: "destructive",
  },
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
}: CourseStatusDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, AcademicResource.COURSE, id, returnTo),
    INITIAL_STATE,
  );
  const config = COURSE_STATUS_DIALOG_CONFIG[targetStatus];
  const Icon = config.icon;

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) return;
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

export function CourseStatusButton({
  status,
  ...props
}: Omit<CourseStatusDialogProps, "targetStatus"> & { status: CourseStatus }): React.ReactElement | null {
  const [open, setOpen] = React.useState(false);
  if (status === "CLOSED") return null;
  const targetStatus = status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const config = COURSE_STATUS_DIALOG_CONFIG[targetStatus];
  return (
    <>
      <Button type="button" size="lg" variant={config.variant} onClick={() => setOpen(true)}>
        {targetStatus === "ACTIVE" ? "Activar" : "Desactivar"}
      </Button>
      {open ? <CourseStatusDialog {...props} targetStatus={targetStatus} open={open} onOpenChange={setOpen} /> : null}
    </>
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
}): React.ReactElement | null {
  const [toggleOpen, setToggleOpen] = React.useState(false);
  const [finalizeOpen, setFinalizeOpen] = React.useState(false);
  if (courseStatus === "CLOSED") return null;
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
