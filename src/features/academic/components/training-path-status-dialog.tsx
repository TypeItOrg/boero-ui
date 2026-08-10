"use client";

import * as React from "react";
import { useActionState } from "react";
import { CircleAlertIcon, RouteIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
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
import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type TrainingPathStatus = "ACTIVE" | "INACTIVE";

type TrainingPathStatusDialogProps = {
  id: string;
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  returnTo: string;
  scope: AcademicScope;
  targetStatus: TrainingPathStatus;
  trainingPathLabel: string;
};

type StatusDialogConfig = {
  actionLabel: string;
  description: (trainingPathLabel: string) => React.ReactNode;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};

const STATUS_DIALOG_CONFIG: Record<TrainingPathStatus, StatusDialogConfig> = {
  ACTIVE: {
    actionLabel: "Activar trayecto formativo",
    description: (trainingPathLabel) => (
      <>
        El trayecto formativo <span className="text-foreground font-semibold">{trainingPathLabel}</span> volverá a estar
        disponible para nuevas configuraciones.
      </>
    ),
    iconClassName: "bg-primary/10 text-primary",
    pendingLabel: "Activando…",
    title: "Activar trayecto formativo",
    variant: "default",
  },
  INACTIVE: {
    actionLabel: "Desactivar trayecto formativo",
    description: (trainingPathLabel) => (
      <>
        El trayecto formativo <span className="text-foreground font-semibold">{trainingPathLabel}</span> dejará de estar
        disponible para nuevas configuraciones.
      </>
    ),
    iconClassName: "bg-destructive/10 text-destructive",
    pendingLabel: "Desactivando…",
    title: "Desactivar trayecto formativo",
    variant: "destructive",
  },
};

const INITIAL_STATE: AcademicActionState = {};

export function TrainingPathStatusDialog({
  id,
  institutionId,
  onOpenChange,
  open,
  returnTo,
  scope,
  targetStatus,
  trainingPathLabel,
}: TrainingPathStatusDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, AcademicResource.TRAINING_PATH, id, returnTo),
    INITIAL_STATE,
  );
  const config = STATUS_DIALOG_CONFIG[targetStatus];

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
              <RouteIcon className="size-6" />
            </div>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
            <AlertDialogDescription>{config.description(trainingPathLabel)}</AlertDialogDescription>
          </AlertDialogHeader>

          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>No se pudo actualizar el trayecto formativo</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <input type="hidden" name="active" value={String(targetStatus === "ACTIVE")} />

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
