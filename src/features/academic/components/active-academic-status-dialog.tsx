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

import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import { ACTIVE_STATUS_DIALOG_CONFIG } from "@features/academic/config/active-status-dialog.config";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { type ActiveStatus } from "@features/academic/types/active-academic-status.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type ActiveAcademicStatusDialogProps = {
  id: string;
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  resource: ActiveAcademicStatusResource;
  resourceLabel: string;
  returnTo: string;
  scope: AcademicScope;
  targetStatus: ActiveStatus;
};

type ActiveAcademicStatusButtonProps = Omit<ActiveAcademicStatusDialogProps, "onOpenChange" | "open" | "targetStatus"> & {
  active: boolean;
  disabled?: boolean;
};

const INITIAL_STATE: AcademicActionState = {};

export function ActiveAcademicStatusDialog({
  id,
  institutionId,
  onOpenChange,
  open,
  resource,
  resourceLabel,
  returnTo,
  scope,
  targetStatus,
}: ActiveAcademicStatusDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, resource, id, returnTo),
    INITIAL_STATE,
  );
  const config = ACTIVE_STATUS_DIALOG_CONFIG[resource][targetStatus];
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

export function ActiveAcademicStatusButton({ active, disabled = false, ...props }: ActiveAcademicStatusButtonProps): ReactElement {
  const [open, setOpen] = useState(false);
  const targetStatus = active ? "INACTIVE" : "ACTIVE";

  return (
    <>
      <Button
        type="button"
        size="lg"
        variant={targetStatus === "INACTIVE" ? "destructive" : "default"}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {targetStatus === "ACTIVE" ? "Activar" : "Desactivar"}
      </Button>
      {open ? <ActiveAcademicStatusDialog {...props} onOpenChange={setOpen} open targetStatus={targetStatus} /> : null}
    </>
  );
}
