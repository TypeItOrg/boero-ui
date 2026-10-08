"use client";

import { useActionState, type ReactElement, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";
import { CalendarCheckIcon, CalendarXIcon, CircleAlertIcon } from "lucide-react";

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
import { parseHttpResponse } from "@common/utils/http-response-error.util";

import { updateAcademicStatusAction } from "@features/academic/actions/update-academic-status.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicYearTransition = Exclude<AcademicYearStatus, "PLANNED">;

type AcademicYearStatusDialogProps = {
  academicYearLabel: string;
  id: string;
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  returnTo: string;
  scope: AcademicScope;
  targetStatus: AcademicYearTransition;
};

type StatusDialogConfig = {
  actionLabel: string;
  description: (academicYearLabel: string) => ReactNode;
  icon: typeof CalendarCheckIcon;
  iconClassName: string;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};

const STATUS_DIALOG_CONFIG: Record<AcademicYearTransition, StatusDialogConfig> = {
  ACTIVE: {
    actionLabel: "Activar ciclo lectivo",
    description: (academicYearLabel) => (
      <>
        El ciclo lectivo <span className="text-foreground font-semibold">{academicYearLabel}</span> quedará disponible como período académico vigente.
      </>
    ),
    icon: CalendarCheckIcon,
    iconClassName: "bg-primary/10 text-primary",
    pendingLabel: "Activando…",
    title: "Activar ciclo lectivo",
    variant: "default",
  },
  CLOSED: {
    actionLabel: "Finalizar ciclo lectivo",
    description: (academicYearLabel) => (
      <>
        La finalización del ciclo lectivo <span className="text-foreground font-semibold">{academicYearLabel}</span> es definitiva y no podrá
        reabrirse.
      </>
    ),
    icon: CalendarXIcon,
    iconClassName: "bg-destructive/10 text-destructive",
    pendingLabel: "Finalizando…",
    title: "Finalizar ciclo lectivo",
    variant: "destructive",
  },
};

const INITIAL_STATE: AcademicActionState = {};

export function AcademicYearStatusDialog({
  academicYearLabel,
  id,
  institutionId,
  onOpenChange,
  open,
  returnTo,
  scope,
  targetStatus,
}: AcademicYearStatusDialogProps): ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, AcademicResource.ACADEMIC_YEAR, id, returnTo),
    INITIAL_STATE,
  );

  const config = STATUS_DIALOG_CONFIG[targetStatus];
  const Icon = config.icon;

  const countQuery = useQuery({
    queryKey: ["academic-year-course-count", scope, institutionId, id],
    enabled: open && targetStatus === "CLOSED",
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ institutionId });
      const response = await fetch(`/api/${scope}/academic/academic-years/${id}/courses/count?${params}`, { cache: "no-store", signal });
      const data = await parseHttpResponse<{ count: number }>(response, "No se pudieron consultar los cursos asociados.");

      if (!Number.isSafeInteger(data?.count) || data.count < 0) {
        throw new Error("No se pudieron consultar los cursos asociados.");
      }

      return data.count;
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const courseCount = countQuery.data;

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
            <AlertDialogDescription>{config.description(academicYearLabel)}</AlertDialogDescription>
            {targetStatus === "CLOSED" ? (
              <p className="text-muted-foreground mt-2 text-sm">
                {countQuery.isError
                  ? "No se pudieron consultar los cursos asociados."
                  : courseCount === undefined
                    ? "Cargando cursos asociados..."
                    : courseCount === 0
                      ? "No hay cursos asociados para cerrar."
                      : `Al finalizar el ciclo lectivo también se cerrarán todos los cursos asociados (${courseCount} ${courseCount === 1 ? "curso" : "cursos"}).`}
              </p>
            ) : null}
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
