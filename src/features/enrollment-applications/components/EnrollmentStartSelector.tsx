"use client";

import * as React from "react";
import { ArrowRightIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
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
}

export function EnrollmentStartSelector({ studyPlans, periods, onStart }: EnrollmentStartSelectorProps): React.ReactElement {
  const [studyPlanId, setStudyPlanId] = React.useState(studyPlans[0]?.id ?? "");
  const [academicYearId, setAcademicYearId] = React.useState(periods[0]?.academicYearId ?? "");

  if (studyPlans.length === 0 || periods.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Inscripción no disponible</AlertTitle>
        <AlertDescription>No hay planes de estudio o períodos de inscripción habilitados en este momento para la institución.</AlertDescription>
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
