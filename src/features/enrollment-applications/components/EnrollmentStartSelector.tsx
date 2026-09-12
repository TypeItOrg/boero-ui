"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircle2Icon, InfoIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";

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
  onStart: (selection: { studyPlanId: string; academicYearId: string }) => void;
  allExcludedByActiveApplication?: boolean;
}

export function EnrollmentStartSelector({
  studyPlans,
  periods,
  onStart,
  allExcludedByActiveApplication = false,
}: EnrollmentStartSelectorProps): React.ReactElement {
  const [studyPlanId, setStudyPlanId] = React.useState(studyPlans[0]?.id ?? "");
  const [academicYearId, setAcademicYearId] = React.useState(periods[0]?.academicYearId ?? "");

  if (studyPlans.length === 0 && allExcludedByActiveApplication) {
    return (
      <Alert variant="success">
        <CheckCircle2Icon className="size-4" />
        <AlertTitle>Ya estás inscripto en todos los trayectos disponibles</AlertTitle>
        <AlertDescription>
          No hace falta que inicies una nueva solicitud. Podés ver el estado de tus inscripciones en{" "}
          <Link href="/my-enrollment-applications">Mis inscripciones</Link>.
        </AlertDescription>
      </Alert>
    );
  }

  if (studyPlans.length === 0 || periods.length === 0) {
    return (
      <Alert>
        <InfoIcon className="size-4" />
        <AlertTitle>Inscripción no disponible por el momento</AlertTitle>
        <AlertDescription>
          {periods.length === 0
            ? "No hay períodos de inscripción abiertos en este momento. Volvé a intentarlo cuando la institución habilite uno nuevo."
            : "No se encuentran planes de estudio disponibles en este momento."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar solicitud de inscripción</CardTitle>
        <CardDescription>Elegí el plan de estudio y el ciclo lectivo al que querés postularte.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <FieldLabel htmlFor="startStudyPlan" required>
            Plan de estudio
          </FieldLabel>
          <Select value={studyPlanId} onValueChange={setStudyPlanId}>
            <SelectTrigger id="startStudyPlan" className="w-full">
              <SelectValue placeholder="Seleccioná un plan de estudio" />
            </SelectTrigger>
            <SelectContent>
              {studyPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} — {plan.trainingPathName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="startPeriod" required>
            Ciclo lectivo / período de inscripción
          </FieldLabel>
          <Select value={academicYearId} onValueChange={setAcademicYearId}>
            <SelectTrigger id="startPeriod" className="w-full">
              <SelectValue placeholder="Seleccioná un período" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.academicYearId}>
                  {period.academicYearNumber} — {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="button" onClick={() => onStart({ studyPlanId, academicYearId })} disabled={!studyPlanId || !academicYearId} className="gap-1.5">
          Comenzar inscripción
          <ArrowRightIcon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
