"use client";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import * as React from "react";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";
import Link from "next/link";
import { CalendarX2Icon, CheckCircle2Icon, FilePenLineIcon, GraduationCapIcon, Loader2Icon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";

export interface EnrollmentStartStudyPlanOption {
  id: string;
  name: string;
  trainingPathName: string;
}

export interface EnrollmentStartPeriodOption {
  id: string;
  academicYearId: string;
  academicYearNumber: number;
  name: string;
}

interface EnrollmentStartSelectorProps {
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods: EnrollmentStartPeriodOption[];
  onStart: (selection: StartEnrollmentApplicationInput) => void;
  allExcludedByActiveApplication?: boolean;
  error?: string;
  isStarting?: boolean;
  studyPlanPagination?: React.ReactNode;
  periodPagination?: React.ReactNode;
}

export function EnrollmentStartSelector({
  studyPlans,
  periods,
  onStart,
  allExcludedByActiveApplication = false,
  error,
  isStarting = false,
  studyPlanPagination,
  periodPagination,
}: EnrollmentStartSelectorProps): React.ReactElement {
  const academicYears = [...new Map(periods.map((period) => [period.academicYearId, period])).values()];
  const [selectedStudyPlan, setSelectedStudyPlan] = React.useState<EnrollmentStartStudyPlanOption | undefined>(studyPlans[0]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<EnrollmentStartPeriodOption | undefined>(academicYears[0]);
  const trainingPathId = selectedStudyPlan?.id ?? "";
  const academicYearId = selectedPeriod?.academicYearId ?? "";

  if (studyPlans.length === 0 && allExcludedByActiveApplication) {
    return (
      <Empty className="bg-muted/25 min-h-56 rounded-xl border border-solid p-6">
        <EmptyHeader className="max-w-sm">
          <EmptyMedia variant="icon">
            <CheckCircle2Icon className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base">Ya tenés una solicitud para todos los trayectos disponibles</EmptyTitle>
          <EmptyDescription>
            No podés iniciar otra solicitud para esos trayectos. Podés continuarla o consultar su estado en{" "}
            <Link href="/my-enrollment-applications">Mis inscripciones</Link>.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if ((studyPlans.length === 0 && !studyPlanPagination) || (periods.length === 0 && !periodPagination)) {
    const hasNoPeriods = periods.length === 0;
    const Icon = hasNoPeriods ? CalendarX2Icon : GraduationCapIcon;

    return (
      <Empty className="bg-muted/25 min-h-56 rounded-xl border border-solid p-6">
        <EmptyHeader className="max-w-sm">
          <EmptyMedia variant="icon">
            <Icon className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base">
            {hasNoPeriods ? "No hay períodos de inscripción abiertos" : "No hay trayectos formativos disponibles"}
          </EmptyTitle>
          <EmptyDescription>{hasNoPeriods ? ENROLLMENT_MESSAGES.ENROLLMENT_CLOSED : ENROLLMENT_MESSAGES.NO_ELIGIBLE_PLANS}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="bg-muted/25">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <FilePenLineIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Iniciar solicitud de inscripción</CardTitle>
            <CardDescription>Elegí el trayecto formativo al que querés postularte.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo iniciar la inscripción</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field className="min-w-0">
            <FieldLabel htmlFor="startStudyPlan" required>
              Trayecto formativo
            </FieldLabel>
            <Select value={trainingPathId} onValueChange={(value) => setSelectedStudyPlan(studyPlans.find((plan) => plan.id === value))}>
              <SelectTrigger id="startStudyPlan" className="h-9! w-full">
                <SelectValue placeholder="Seleccioná un trayecto formativo">
                  {selectedStudyPlan ? `${selectedStudyPlan.name} — ${selectedStudyPlan.trainingPathName}` : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {studyPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="px-2.5 py-1.5">
                      {plan.name} — {plan.trainingPathName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {studyPlans.length === 0 && (
              <p className="text-muted-foreground text-sm">No hay trayectos disponibles en esta página. Podés consultar las demás páginas.</p>
            )}
            {studyPlanPagination}
          </Field>

          <Field className="min-w-0">
            <FieldLabel htmlFor="startPeriod" required>
              Ciclo lectivo
            </FieldLabel>
            <Select
              value={academicYearId}
              onValueChange={(value) => setSelectedPeriod(academicYears.find((period) => period.academicYearId === value))}
            >
              <SelectTrigger id="startPeriod" className="h-9! w-full">
                <SelectValue placeholder="Seleccioná un ciclo lectivo">{selectedPeriod?.academicYearNumber}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {academicYears.map((period) => (
                    <SelectItem key={period.academicYearId} value={period.academicYearId} className="px-2.5 py-1.5">
                      {period.academicYearNumber}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {periodPagination}
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="button" size="lg" onClick={() => onStart({ trainingPathId, academicYearId })} disabled={isStarting || !trainingPathId}>
          {isStarting ? (
            <>
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
              Iniciando…
            </>
          ) : (
            "Comenzar inscripción"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
