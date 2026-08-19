"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import { CalendarCheckIcon, CalendarXIcon, CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/ui/date-picker";
import { Field, FieldContent, FieldError, FieldLabel } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";
import { updateAcademicStatusAction } from "@features/academic/actions/academic-resource.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type StudyPlanStatusTransition = Exclude<StudyPlanStatus, "DRAFT">;

type StudyPlanStatusDialogProps = {
  effectiveFrom: string | null;
  id: string;
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  returnTo: string;
  scope: AcademicScope;
  studyPlanLabel: string;
  targetStatus: StudyPlanStatusTransition;
};

type StatusDialogConfig = {
  actionLabel: string;
  description: (studyPlanLabel: string) => React.ReactNode;
  icon: typeof CalendarCheckIcon;
  iconClassName: string;
  needsEffectiveTo: boolean;
  pendingLabel: string;
  title: string;
  variant: "default" | "destructive";
};

const STATUS_DIALOG_CONFIG: Record<StudyPlanStatusTransition, StatusDialogConfig> = {
  ACTIVE: {
    actionLabel: "Activar plan de estudio",
    description: (studyPlanLabel) => (
      <>
        El plan de estudio <span className="text-foreground font-semibold">{studyPlanLabel}</span> quedará disponible
        como versión curricular vigente.
      </>
    ),
    icon: CalendarCheckIcon,
    iconClassName: "bg-primary/10 text-primary",
    needsEffectiveTo: false,
    pendingLabel: "Activando…",
    title: "Activar plan de estudio",
    variant: "default",
  },
  INACTIVE: {
    actionLabel: "Desactivar plan de estudio",
    description: (studyPlanLabel) => (
      <>
        El plan de estudio <span className="text-foreground font-semibold">{studyPlanLabel}</span> conservará su
        currícula histórica y dejará de estar vigente.
      </>
    ),
    icon: CalendarXIcon,
    iconClassName: "bg-destructive/10 text-destructive",
    needsEffectiveTo: true,
    pendingLabel: "Desactivando…",
    title: "Desactivar plan de estudio",
    variant: "destructive",
  },
};

const INITIAL_STATE: AcademicActionState = {};

export function StudyPlanStatusDialog({
  effectiveFrom,
  id,
  institutionId,
  onOpenChange,
  open,
  returnTo,
  scope,
  studyPlanLabel,
  targetStatus,
}: StudyPlanStatusDialogProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState(
    updateAcademicStatusAction.bind(null, scope, institutionId, AcademicResource.STUDY_PLAN, id, returnTo),
    INITIAL_STATE,
  );
  const config = STATUS_DIALOG_CONFIG[targetStatus];
  const Icon = config.icon;
  const [effectiveTo, setEffectiveTo] = useState<Date>();
  const [effectiveToDraft, setEffectiveToDraft] = useState("");
  const effectiveFromDate = parseDateInput(effectiveFrom);
  const hasInvalidEffectiveTo =
    effectiveFromDate !== undefined && effectiveTo !== undefined && effectiveTo < effectiveFromDate;
  const effectiveToError = hasInvalidEffectiveTo
    ? "La fecha final no puede ser anterior al inicio del plan."
    : state.fieldErrors?.effectiveTo;
  const effectiveToId = React.useId();

  function handleOpenChange(nextOpen: boolean): void {
    if (isPending && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className={config.needsEffectiveTo ? "sm:max-w-lg" : undefined}>
        <form action={formAction}>
          <AlertDialogHeader>
            <div className={cn(config.iconClassName, "mb-1 flex size-12 items-center justify-center rounded-2xl")}>
              <Icon />
            </div>
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
            <AlertDialogDescription>{config.description(studyPlanLabel)}</AlertDialogDescription>
          </AlertDialogHeader>

          {state.error ? (
            <Alert className="mt-4" variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <input type="hidden" name="status" value={targetStatus} />
          {config.needsEffectiveTo ? (
            <Field className="mt-5" data-invalid={Boolean(effectiveToError)}>
              <FieldContent>
                <FieldLabel htmlFor={effectiveToId} required>
                  Fecha de finalización
                </FieldLabel>
              </FieldContent>
              <input type="hidden" name="effectiveFrom" value={effectiveFrom ?? ""} />
              <input
                type="hidden"
                name="effectiveTo"
                value={effectiveTo ? formatDateInput(effectiveTo) : effectiveToDraft}
              />
              <DatePicker
                id={effectiveToId}
                value={effectiveTo}
                onChange={setEffectiveTo}
                onDraftChange={setEffectiveToDraft}
                calendarMinDate={effectiveFromDate}
                autoComplete="off"
                required
                aria-invalid={Boolean(effectiveToError)}
              />
              <FieldError errors={effectiveToError ? [{ message: effectiveToError }] : undefined} />
            </Field>
          ) : null}

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
