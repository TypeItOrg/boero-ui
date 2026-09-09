"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircleIcon, FilePlus2Icon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldError, FieldGroup } from "@common/components/ui/field";
import { createEnrollmentApplicationAction } from "@features/enrollment/actions/create-enrollment-application.action";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";

type CreateEnrollmentApplicationFormProps = {
  academicYears: readonly AcademicYear[];
  returnTo: string;
  studyPlans: readonly StudyPlan[];
};

const INITIAL_STATE: EnrollmentApplicationActionState = {};

export function CreateEnrollmentApplicationForm({
  academicYears,
  returnTo,
  studyPlans,
}: CreateEnrollmentApplicationFormProps): React.ReactElement {
  const action = createEnrollmentApplicationAction.bind(null, returnTo);
  const [state, formAction, isPending] = React.useActionState(action, INITIAL_STATE);
  const studyPlanErrors = state.fieldErrors?.studyPlanId ? [{ message: state.fieldErrors.studyPlanId }] : undefined;
  const academicYearErrors = state.fieldErrors?.academicYearId ? [{ message: state.fieldErrors.academicYearId }] : undefined;
  const canSubmit = studyPlans.length > 0 && academicYears.length > 0 && !isPending;

  return (
    <form action={formAction} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
      <div className="space-y-4">
        {state.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>No se pudo crear la solicitud</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        {!canSubmit ? (
          <Alert>
            <AlertCircleIcon className="size-4" />
            <AlertTitle>No hay opciones disponibles</AlertTitle>
            <AlertDescription>
              Necesitás al menos un plan de estudio activo y un ciclo lectivo activo para iniciar otra solicitud.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Nueva solicitud</CardTitle>
            <CardDescription>Elegí el plan de estudio y el ciclo lectivo con los que querés iniciar esta inscripción.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FieldGroup className="space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Plan de estudio</span>
                <select
                  name="studyPlanId"
                  aria-invalid={studyPlanErrors ? true : undefined}
                  disabled={isPending || studyPlans.length === 0}
                  defaultValue=""
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar plan de estudio</option>
                  {studyPlans.map((studyPlan) => (
                    <option key={studyPlan.id} value={studyPlan.id}>
                      {studyPlan.name} · {studyPlan.trainingPathName}
                    </option>
                  ))}
                </select>
              </label>
              <FieldError errors={studyPlanErrors} />
            </FieldGroup>

            <FieldGroup className="space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Ciclo lectivo</span>
                <select
                  name="academicYearId"
                  aria-invalid={academicYearErrors ? true : undefined}
                  disabled={isPending || academicYears.length === 0}
                  defaultValue=""
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar ciclo lectivo</option>
                  {academicYears.map((academicYear) => (
                    <option key={academicYear.id} value={academicYear.id}>
                      {academicYear.year}
                    </option>
                  ))}
                </select>
              </label>
              <FieldError errors={academicYearErrors} />
            </FieldGroup>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button asChild type="button" variant="outline" className="w-full sm:w-auto">
                <Link href={returnTo}>Cancelar</Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={!canSubmit}>
                {isPending ? <Loader2Icon className="animate-spin" /> : <FilePlus2Icon />}
                Crear solicitud
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Qué pasa después</CardTitle>
            <CardDescription>La nueva solicitud queda creada como borrador y podés seguir completándola después.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="bg-muted/40 rounded-lg border px-3 py-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Paso 1</p>
              <p className="mt-1 font-medium">Seleccionar trayecto formativo</p>
            </div>
            <div className="bg-muted/40 rounded-lg border px-3 py-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Paso 2</p>
              <p className="mt-1 font-medium">Elegir espacios académicos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opciones disponibles</CardTitle>
            <CardDescription>Mostramos solo los planes de estudio y ciclos lectivos activos para tu institución.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{studyPlans.length} plan(es) de estudio habilitado(s).</p>
            <p>{academicYears.length} ciclo(s) lectivo(s) habilitado(s).</p>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
