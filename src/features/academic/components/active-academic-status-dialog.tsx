"use client";

import * as React from "react";
import { useActionState } from "react";
import { CircleAlertIcon, LibraryBigIcon, Music2Icon, RouteIcon } from "lucide-react";

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
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { ActiveAcademicStatusResource } from "@features/academic/types/active-academic-status-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type ActiveStatus = "ACTIVE" | "INACTIVE";

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

type ActiveAcademicStatusButtonProps = Omit<
  ActiveAcademicStatusDialogProps,
  "onOpenChange" | "open" | "targetStatus"
> & {
  active: boolean;
  disabled?: boolean;
};

type ActiveStatusDialogConfig = {
  actionLabel: string;
  description: (resourceLabel: string) => React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};

const INITIAL_STATE: AcademicActionState = {};

const ACTIVE_STATUS_DIALOG_CONFIG: Record<
  ActiveAcademicStatusResource,
  Record<ActiveStatus, ActiveStatusDialogConfig>
> = {
  [AcademicResource.TRAINING_PATH]: {
    ACTIVE: {
      actionLabel: "Activar trayecto formativo",
      description: (resourceLabel) => (
        <>
          El trayecto formativo <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar
          disponible para nuevas configuraciones.
        </>
      ),
      icon: RouteIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar trayecto formativo",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar trayecto formativo",
      description: (resourceLabel) => (
        <>
          El trayecto formativo <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar
          disponible para nuevas configuraciones.
        </>
      ),
      icon: RouteIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar trayecto formativo",
      variant: "destructive",
    },
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    ACTIVE: {
      actionLabel: "Activar espacio académico",
      description: (resourceLabel) => (
        <>
          El espacio académico <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar
          disponible para nuevas configuraciones curriculares.
        </>
      ),
      icon: LibraryBigIcon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar espacio académico",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar espacio académico",
      description: (resourceLabel) => (
        <>
          El espacio académico <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar
          disponible para nuevas configuraciones curriculares. No se podrá desactivar si está utilizado en un plan de
          estudio borrador o activo.
        </>
      ),
      icon: LibraryBigIcon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar espacio académico",
      variant: "destructive",
    },
  },
  [AcademicResource.INSTRUMENT]: {
    ACTIVE: {
      actionLabel: "Activar instrumento",
      description: (resourceLabel) => (
        <>
          El instrumento <span className="text-foreground font-semibold">{resourceLabel}</span> volverá a estar
          disponible para nuevas configuraciones.
        </>
      ),
      icon: Music2Icon,
      iconClassName: "bg-primary/10 text-primary",
      pendingLabel: "Activando…",
      title: "Activar instrumento",
      variant: "default",
    },
    INACTIVE: {
      actionLabel: "Desactivar instrumento",
      description: (resourceLabel) => (
        <>
          El instrumento <span className="text-foreground font-semibold">{resourceLabel}</span> dejará de estar
          disponible para nuevas configuraciones.
        </>
      ),
      icon: Music2Icon,
      iconClassName: "bg-destructive/10 text-destructive",
      pendingLabel: "Desactivando…",
      title: "Desactivar instrumento",
      variant: "destructive",
    },
  },
};

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
}: ActiveAcademicStatusDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, resource, id, returnTo),
    INITIAL_STATE,
  );
  const config = ACTIVE_STATUS_DIALOG_CONFIG[resource][targetStatus];
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

export function ActiveAcademicStatusButton({
  active,
  disabled = false,
  ...props
}: ActiveAcademicStatusButtonProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
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
