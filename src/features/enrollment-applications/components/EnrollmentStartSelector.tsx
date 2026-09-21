"use client";
import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";

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
interface Props {
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods?: EnrollmentStartPeriodOption[];
  onStart: (selection: StartEnrollmentApplicationInput) => void;
  error?: string;
  isStarting?: boolean;
  studyPlanPagination?: React.ReactNode;
}
export function formatEnrollmentStartOptionLabel(option: Pick<EnrollmentStartStudyPlanOption, "name" | "trainingPathName">): string {
  return !option.trainingPathName || option.trainingPathName === option.name ? option.name : `${option.name} — ${option.trainingPathName}`;
}

export function EnrollmentStartSelector({ studyPlans, onStart, error, isStarting = false, studyPlanPagination }: Props): React.ReactElement {
  const [selectedId, setSelectedId] = React.useState(studyPlans[0]?.id ?? "");
  const trainingPathId = studyPlans.some((path) => path.id === selectedId) ? selectedId : (studyPlans[0]?.id ?? "");
  return (
    <Card className="bg-muted/25">
      <CardHeader className="border-b">
        <CardTitle>Iniciar solicitud de inscripción</CardTitle>
        <CardDescription>
          Elegí el trayecto formativo. En la pestaña Cursos vas a encontrar las opciones disponibles para inscribirte.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo iniciar la inscripción</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="startStudyPlan">Trayecto formativo</FieldLabel>
          <Select value={trainingPathId} disabled={isStarting} onValueChange={setSelectedId}>
            <SelectTrigger id="startStudyPlan">
              <SelectValue placeholder="Seleccioná un trayecto" />
            </SelectTrigger>
            <SelectContent>
              {studyPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {formatEnrollmentStartOptionLabel(plan)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {studyPlanPagination}
        </Field>
        {studyPlans.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay trayectos con cursos disponibles para inscribirse en esta página.</p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" size="lg" disabled={isStarting || !trainingPathId} onClick={() => onStart({ trainingPathId })}>
          {isStarting ? (
            <>
              <Loader2Icon className="animate-spin" />
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
